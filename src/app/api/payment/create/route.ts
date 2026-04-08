import { NextRequest, NextResponse } from 'next/server';
import { initializeCheckoutForm } from '@/lib/payment/processor';
import { getProduct } from '@/lib/payment/products';
import { createAdminClient } from '@/lib/supabase';
import {
  getCallbackBaseUrl,
  MissingCallbackBaseUrlError,
} from '@/lib/payment/callback-url';

// Sprint C P3: ensure this route runs on the Node.js runtime so that
// iyzipay's CommonJS module loads correctly.
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customer } = body;

    // Validate required fields
    if (
      !productId ||
      !customer?.firstName ||
      !customer?.lastName ||
      !customer?.email
    ) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: 'Gecersiz urun' }, { status: 400 });
    }

    // Generate conversation ID
    const conversationId = `AKM-${Date.now()}`;

    // Sprint C P3: callback URL via centralized helper.
    // - NEXT_PUBLIC_SITE_URL → VERCEL_URL → localhost (dev only) → throws in prod
    // - Returns a clear MISSING_CALLBACK_BASE_URL error code instead of letting
    //   the iyzipay SDK silently swallow a bad localhost callback.
    let callbackUrl: string;
    try {
      callbackUrl = `${getCallbackBaseUrl()}/api/payment/callback`;
    } catch (urlErr) {
      if (urlErr instanceof MissingCallbackBaseUrlError) {
        console.error('[Payment] callback base url missing:', urlErr.code);
        return NextResponse.json(
          {
            error: 'callback_base_url_missing',
            code: 'MISSING_CALLBACK_BASE_URL',
            hint: 'Set NEXT_PUBLIC_SITE_URL in Vercel Production env or rely on VERCEL_URL.',
          },
          { status: 500 }
        );
      }
      throw urlErr;
    }

    // Create order in DB
    let orderId: string | null = null;
    try {
      const supabase = createAdminClient();
      const { data: order, error: dbError } = await supabase
        .from('odemeler')
        .insert({
          tutar: product.price,
          para_birimi: 'TRY',
          durum: 'beklemede',
          iyzico_conversation_id: conversationId,
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('[Payment] DB error:', dbError);
      } else {
        orderId = order?.id ?? null;
      }
    } catch (dbErr) {
      console.error('[Payment] DB connection error:', dbErr);
    }

    // Initialize iyzico checkout form
    const result = await initializeCheckoutForm({
      product,
      customer,
      conversationId,
      callbackUrl,
    });

    if (result.success) {
      return NextResponse.json({
        checkoutFormContent: result.checkoutFormContent,
        token: result.token,
        orderId,
      });
    } else {
      return NextResponse.json(
        { error: result.errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Payment] Create error:', error);
    return NextResponse.json(
      { error: 'Odeme baslatilamadi' },
      { status: 500 }
    );
  }
}
