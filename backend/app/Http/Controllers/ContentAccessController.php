<?php

namespace App\Http\Controllers;

use App\Models\AccessRecord;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Field;
use App\Models\SiteFeature;
use App\Models\PaymentLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContentAccessController extends Controller
{
    /**
     * Unlock content using coins.
     */
    public function unlockWithCoins(Request $request)
    {
        $request->validate([
            'accessible_id' => 'required',
            'accessible_type' => 'required|string|in:lesson,section,field,feature',
        ]);

        $user = $request->user();
        $type = $request->accessible_type;
        $id = $request->accessible_id;

        $modelClass = $this->getModelClass($type);
        $resource = $modelClass::findOrFail($id);

        if ($resource->access_type !== 'premium') {
            return response()->json(['message' => 'هذا المحتوى مجاني بالفعل.'], 400);
        }

        // Check if already owned
        if ($user->accessRecords()->where('accessible_type', $modelClass)->where('accessible_id', $id)->where('status', 'active')->exists()) {
            return response()->json(['message' => 'تم فتح هذا المحتوى مسبقاً.'], 400);
        }

        if ($user->coins < $resource->price) {
            return response()->json(['message' => 'رصيد العملات غير كافٍ.'], 403);
        }

        return DB::transaction(function () use ($user, $resource, $modelClass, $type) {
            $user->decrement('coins', $resource->price);

            $record = $user->accessRecords()->create([
                'accessible_type' => $modelClass,
                'accessible_id' => $resource->id,
                'status' => 'active',
                'payment_method' => 'coins',
            ]);

            PaymentLedger::create([
                'user_id' => $user->id,
                'access_record_id' => $record->id,
                'amount_dzd' => 0.00,
                'coins_amount' => $resource->price,
                'payment_method' => 'coins',
                'transaction_type' => 'debit',
                'description' => 'فتح محتوى بالعملات الرقمية: ' . ($resource->title ?? $resource->name ?? $type),
                'approved_by' => null,
            ]);

            return response()->json([
                'message' => 'تم فتح المحتوى بنجاح.',
                'remaining_coins' => $user->coins
            ]);
        });
    }

    /**
     * Submit payment proof (Receipt).
     */
    public function submitReceipt(Request $request)
    {
        $request->validate([
            'accessible_id' => 'required',
            'accessible_type' => 'required|string|in:lesson,section,field,feature',
            'receipt' => 'required|image|max:2048', // 2MB Max
        ]);

        $user = $request->user();
        $type = $request->accessible_type;
        $id = $request->accessible_id;
        $modelClass = $this->getModelClass($type);

        $path = $request->file('receipt')->store('receipts', 'public');

        $user->accessRecords()->create([
            'accessible_type' => $modelClass,
            'accessible_id' => $id,
            'status' => 'pending_verification',
            'payment_method' => 'external_receipt',
            'receipt_path' => $path,
        ]);

        return response()->json(['message' => 'تم إرسال وصل الدفع بنجاح. سيقوم المعلم بمراجعته قريباً.']);
    }

    /**
     * Teacher/Admin: Approve Access.
     */
    public function approveAccess(AccessRecord $record)
    {
        if (!auth()->user()->is_admin && !auth()->user()->is_teacher) {
            abort(403, 'Unauthorized.');
        }

        return DB::transaction(function () use ($record) {
            $record->update([
                'status' => 'active',
                'granted_by' => auth()->id()
            ]);

            PaymentLedger::create([
                'user_id' => $record->user_id,
                'access_record_id' => $record->id,
                'amount_dzd' => 0.00,
                'coins_amount' => 0,
                'payment_method' => $record->payment_method ?? 'external_receipt',
                'transaction_type' => 'credit',
                'description' => 'تفعيل الوصول بالموافقة على وصل الدفع الخارجي',
                'approved_by' => auth()->id(),
            ]);

            return response()->json(['message' => 'تم تفعيل الوصول بنجاح.']);
        });
    }

    /**
     * Get pending receipts for teachers.
     */
    public function getPendingReceipts()
    {
        if (!auth()->user()->is_admin && !auth()->user()->is_teacher) {
            abort(403, 'Unauthorized.');
        }

        $records = AccessRecord::with(['user', 'accessible'])
            ->where('status', 'pending_verification')
            ->latest()
            ->get();

        return response()->json($records);
    }

    /**
     * Admin: Get Financial Ledger Audit Records for ERP Management.
     */
    public function getFinancialLedger(Request $request)
    {
        if (!auth()->user()->is_admin) {
            abort(403, 'Unauthorized.');
        }

        $ledgers = PaymentLedger::with(['user:id,name,email', 'approver:id,name', 'accessRecord'])
            ->latest()
            ->paginate(30);

        $summary = [
            'total_transactions' => PaymentLedger::count(),
            'total_coins_debited' => PaymentLedger::where('transaction_type', 'debit')->sum('coins_amount'),
            'total_approved_credits' => PaymentLedger::where('transaction_type', 'credit')->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'ledger' => $ledgers,
        ]);
    }

    protected function getModelClass($type)
    {
        return match ($type) {
            'lesson' => Lesson::class,
            'section' => Section::class,
            'field' => Field::class,
            'feature' => SiteFeature::class,
        };
    }
}
