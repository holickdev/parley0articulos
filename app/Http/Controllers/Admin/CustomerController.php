<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Customers/Index', [
            'customers' => Customer::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Customers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'identification' => 'required|string|max:20|unique:customers,identification',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        Customer::create($validated);

        return redirect()->route('admin.customers.index')->with('success', 'Cliente creado con éxito.');
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Admin/Customers/Edit', [
            'customer' => $customer
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'identification' => 'required|string|max:20|unique:customers,identification,' . $customer->id,
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        $customer->update($validated);

        return redirect()->route('admin.customers.index')->with('success', 'Cliente actualizado con éxito.');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->entries()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar un cliente con cuadros asociados.');
        }

        $customer->delete();

        return redirect()->route('admin.customers.index')->with('success', 'Cliente eliminado con éxito.');
    }
}
