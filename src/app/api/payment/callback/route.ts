import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutForm } from '@/lib/payment/processor';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.redirect(
        new URL('/odeme?status=error&message=token_missing', request.url)
      );
    }

    const result = await retrieveCheckoutForm(token);

    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      console.error('[Payment] Supabase admin client not available');
    }

    if (result.success) {
      // Update payment record as successful
      if (supabase && result.conversationId) {
        await supabase
          .from('odemeler')
          .update({
            durum: 'basarili',
            iyzico_payment_id: result.paymentId,
            kart_son_dort: result.cardLastFour,
            kart_tipi: result.cardType,
            iyzico_response: result.rawResponse,
            updated_at: new Date().toISOString(),
          })
          .eq('iyzico_conversation_id', result.conversationId);
      }

      return NextResponse.redirect(
        new URL(
          `/odeme?status=success&paymentId=${result.paymentId}`,
          request.url
        )
      );
    } else {
      // Update payment as failed
      if (supabase && result.rawResponse?.conversationId) {
        await supabase
          .from('odemeler')
          .update({
            durum: 'basarisiz',
            iyzico_response: result.rawResponse,
            updated_at: new Date().toISOString(),
          })
          .eq(
            'iyzico_conversation_id',
            result.rawResponse.conversationId as string
          );
      }

      return NextResponse.redirect(
        new URL(
          `/odeme?status=error&message=${encodeURIComponent(result.errorMessage || 'Odeme basarisiz')}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error('[Payment] Callback error:', error);
    return NextResponse.redirect(
      new URL('/odeme?status=error&message=server_error', request.url)
    );
  }
}
