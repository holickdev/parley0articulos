<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Payments/Index', [
            'payments' => Payment::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'identification' => 'required|string|max:20',
            'bank' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'reference' => 'required|string|max:255|unique:payments,reference',
            'amount_bs' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
        ]);

        Payment::create($validated);

        return redirect()->route('admin.payments.index')->with('success', 'Pago registrado con éxito.');
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'identification' => 'required|string|max:20',
            'bank' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'reference' => 'required|string|max:255|unique:payments,reference,' . $payment->id,
            'amount_bs' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
        ]);

        $payment->update($validated);

        return redirect()->route('admin.payments.index')->with('success', 'Pago actualizado con éxito.');
    }

    public function destroy(Payment $payment)
    {
        if ($payment->entry()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar un pago asociado a un cuadro.');
        }

        $payment->delete();

        return redirect()->route('admin.payments.index')->with('success', 'Pago eliminado con éxito.');
    }
}
