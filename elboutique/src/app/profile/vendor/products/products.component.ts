import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VendorProdcutService } from '../../../service/vendor/productdata.service';
import { VendorCatgoriesService } from '../../../service/vendor/categories.service';
import { VendorAddProductService } from '../../../service/vendor/product.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
declare const bootstrap: any;

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductsComponent implements OnInit  {
  products: any[] = [];
  categories: any[] = [];
  editingIndex: number | null = null;
  isEditing: boolean = false;
  userInfo: string | null = localStorage.getItem('user_info');
  user_id: number = 0;
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private VendorProdcutService: VendorProdcutService,
    private VendorAddProductService: VendorAddProductService,
    private vendorCatgoriesService: VendorCatgoriesService
  ) {
    if (this.userInfo) {
      try {
        const parsedUserInfo = JSON.parse(this.userInfo);
        this.user_id = parsedUserInfo.id;
      } catch (error) {
        console.error('Error parsing user info from local storage', error);
      }
    }

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,2})?$')]],
      category: ['', Validators.required],
      quantity: ['', Validators.required],
      stock: ['', Validators.required],
      material: ['', Validators.required],
      materialDescription: ['', Validators.required],
      images: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }


  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const files = event.target.files;
      this.productForm.patchValue({
        images: files
      });
    }
  }

  loadCategories() {
    this.vendorCatgoriesService.getCategories().subscribe(
      response => {
        this.categories = response.data;
        console.log(this.categories);
      },
      error => {
        console.error('Error loading categories:', error);
      }
    );
  }
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  loadProducts() {
  this.VendorProdcutService.getVendorProducts(this.user_id).subscribe(
      response => {
        this.products = response.data;
        console.log(`the respnse:`);
        console.log(this.products);
      },
      error => {
        console.error('Error loading products:', error);
      }
    );
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('category_id', this.productForm.get('category')?.value);
      formData.append('vendor_id', this.user_id.toString());
      formData.append('stock', this.productForm.get('quantity')?.value);
      formData.append('attributes[0][name]', this.productForm.get('material')?.value);
      formData.append('attributes[0][value]', this.productForm.get('materialDescription')?.value);
  
      const images = this.productForm.get('images')?.value;
      for (let i = 0; i < images.length; i++) {
        console.log(images[i])
        formData.append(`images[${i}]`, images[i]);
      }

  
      console.log(images);

      if (this.isEditing && this.editingIndex !== null) {
        console.log('Edited Product Data:', formData);
    
        this.VendorAddProductService.updateProductVendor(this.editingIndex, formData).subscribe(
          response => {
            console.log('Product updated successfully:', response);
            this.products[this.editingIndex!] = response; 
            this.productForm.reset();
          },
          error => {
            console.error('Error updating product:', error);
          }
        );
      } else {
        console.log(formData);
        this.VendorAddProductService.addProductVendor(formData).subscribe(
          response => {
            console.log('Product added successfully:', response);
            this.products.push(response);
            this.productForm.reset();
          },
          error => {
            console.error('Error adding product:', error);
          }
        );
      }
  
      this.productForm.reset();
      this.isEditing = false;
      this.editingIndex = null;
    }
  }
  editProduct(index: number) {
    this.editingIndex = index;
    const product = this.products.find(product => product.id === index);

    if (!product) {
      console.error('Product not found with id:', index);
      return;
    }

    this.productForm.patchValue(product);
    this.isEditing = true;
    const modalElement = document.getElementById('addProductModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  async confirmDelete(index: number) {
    const result = await this.showSweetAlert();
    if (result.isConfirmed) {
      this.deleteProduct(index);
      Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
    }
  }

  async showSweetAlert(): Promise<any> {
    return Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    });
  }
  deleteProduct(index: number) {
   this.VendorAddProductService.deleteProdcutVendor(index).subscribe(
      data=>{
        console.log(data);
      }
    )
  }


}