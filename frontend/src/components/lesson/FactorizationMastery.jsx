import React from 'react';
import { ArrowRight } from 'lucide-react';
import MasteryLabEngine from './MasteryLabEngine';

const FACTORIZATION_CONFIG = {
    title: 'مختبر إتقان التحليل والنشر',
    themeColor: 'violet',
    lessons: [
        {
            title: 'ما هو النشر؟',
            content: 'النشر هو تحويل جداء (ضرب) إلى مجموع أو فرق. تخيل أنك توزع الهدايا على كل من في الغرفة!',
            visual: (
                <div className="bg-white p-6 rounded-2xl shadow-inner border-2 border-slate-50 flex items-center gap-4 text-xl font-black italic text-violet-600">
                    a(b + c) <ArrowRight className="text-slate-300" /> ab + ac
                </div>
            )
        },
        {
            title: 'ما هو التحليل؟',
            content: 'التحليل هو عكس النشر تماماً! هو البحث عن "عامل مشترك" بين حدين وجمعهما في قوس واحد.',
            visual: (
                <div className="bg-white p-6 rounded-2xl shadow-inner border-2 border-slate-50 flex items-center gap-4 text-xl font-black italic text-emerald-600">
                     ab + ac <ArrowRight className="text-slate-300" /> a(b + c)
                </div>
            )
        }
    ],
    challenges: [
        {
            question: 'وزع (انشر): 3(x + 4)',
            answer: '3x+12',
            hint: 'اضرب 3 في x أولاً، ثم اضرب 3 في 4.',
            successMsg: 'رائع! لقد وزعت الهدايا (الأرقام) بشكل مثالي.'
        },
        {
            question: 'حلل (استخرج العامل المشترك): 5x + 10',
            answer: '5(x+2)',
            hint: 'ما هو الرقم الذي يقسم 5 و 10 في نفس الوقت؟ استخرجه كعامل مشترك.',
            successMsg: 'قناص ماهر! لقد عثرت على العامل المشترك 5.'
        },
        {
            question: 'انشر العبارة: x(x + 5)',
            answer: 'x^2+5x',
            hint: 'تذكر أن x مضروب في x يساوي x مربع (^2).',
            successMsg: 'مذهل! لقد تعاملت مع الرموز بذكاء رياضي.'
        }
    ]
};

export default function FactorizationMastery() {
    return <MasteryLabEngine config={FACTORIZATION_CONFIG} />;
}
