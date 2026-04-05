import { NextRequest, NextResponse } from 'next/server';
import { initializeCheckoutForm } from '@/lib/payment/processor';
import { getProduct } from '@/lib/payment/products';
import { createAdminClient } from '@/lib/supabase';

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

    // Determine callback URL
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/payment/callback`;

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
