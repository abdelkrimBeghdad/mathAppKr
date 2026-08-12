<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * إصلاح حقيقي: بعد تحويل تسجيل الدخول/التسجيل لاعتماد الجلسة (Sanctum SPA
     * cookie mode)، أي اختبار PHPUnit يصل إلى تلك المسارات بدون هيدر Referer
     * يطابق SANCTUM_STATEFUL_DOMAINS كان يتسبب في "Session store not set on
     * request" — لأن EnsureFrontendRequestsAreStateful لا يعتبر الطلب "من
     * واجهة أمامية" فلا يُفعّل StartSession إطلاقاً.
     *
     * $this->defaultHeaders يُدمَج تلقائياً مع كل طلب اختباري (postJson/getJson
     * إلخ) في كل ملفات الاختبار الموروثة من هذا الكلاس، فهذا إصلاح مركزي واحد
     * بدل تعديل كل ملف اختبار يستدعي /login أو /register على حدة.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->defaultHeaders['Referer'] = config('app.url', 'http://localhost');
    }
}
