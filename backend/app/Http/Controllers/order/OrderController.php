<?php

namespace App\Http\Controllers\order;

use App\Http\Requests\StoreOrderProductRequest;
use App\Models\Order;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\Product;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny',Order::class);
        return OrderResource::collection(Order::with('products')->get());
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {

        $order= Order::create([
            'customer_id'=>$request->customer_id,
            'status'=>$request->status,
            "total" => $request->total
        ]);
        return response()->json([
            "message" => 'Order Added',
            "order" => $order
        ],201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order=Order::with('products')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        $this->authorize('view',$order);

        return response()->json($order,200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(StoreOrderRequest $request, $id)
    {
        $order= Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        $this->authorize('update',$order);
        $order->update([
            'customer_id'=>$request->customer_id,
            'status'=>$request->status,
            "total" => $request->total
        ]);
        return response()->json(['message' => 'Order updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order= Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        $this->authorize('delete',$order);
        $order->delete();
         
        return response()->json(["message"=> "Order Deleted"]);
    }

    public function getUserOrders($id){
        $customer = Customer::find($id);
        if (!$customer) {
            return response()->json(["message"=> "Customer Doesn't exist"],404);
        }
        $this->authorize('getUserOrders', $customer);
        $orders = Order::where('customer_id',$id)->with(['products','products.images'])->get();
        return response()->json(["orders"=>$orders]);
    }
}
