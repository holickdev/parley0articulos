<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Guest\PublicController;

Route::get('/', [PublicController::class, 'index'])->name('home');
Route::get('/championships/{championship}/entries', [PublicController::class, 'entries'])->name('public.entries');
Route::get('/championships/{championship}/top-coleadores', [PublicController::class, 'getTopColeadores'])->name('public.championships.top-coleadores');
Route::post('/championships/{championship}/check-combination', [PublicController::class, 'checkCombination'])->name('public.entries.check');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin', \App\Http\Controllers\Admin\DashboardController::class)->name('admin');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('coleadores', \App\Http\Controllers\Admin\ColeadorController::class);
        Route::resource('championships', \App\Http\Controllers\Admin\ChampionshipController::class);
        Route::get('championships/{championship}/scores', [\App\Http\Controllers\Admin\ScoreController::class, 'index'])->name('championships.scores.index');
        Route::get('championships/{championship}/scores/create', [\App\Http\Controllers\Admin\ScoreController::class, 'create'])->name('championships.scores.create');
        Route::post('championships/{championship}/scores', [\App\Http\Controllers\Admin\ScoreController::class, 'store'])->name('championships.scores.store');

        Route::resource('championships.entries', \App\Http\Controllers\Admin\EntryController::class);
        Route::get('championships/{championship}/entries-pdf', [\App\Http\Controllers\Admin\EntryController::class, 'downloadPdf'])->name('championships.entries.pdf');
        Route::get('championships/{championship}/top-coleadores', [\App\Http\Controllers\Admin\EntryController::class, 'getTopColeadores'])->name('championships.top-coleadores');
        Route::post('championships/{championship}/entries/check-combination', [\App\Http\Controllers\Admin\EntryController::class, 'checkCombination'])->name('championships.entries.check');

        Route::resource('rounds', \App\Http\Controllers\Admin\RoundController::class);

        // Individual score management can still exist but index and create are now scoped
        Route::resource('scores', \App\Http\Controllers\Admin\ScoreController::class)->except(['index', 'create', 'store']);
    });
});

require __DIR__.'/auth.php';
