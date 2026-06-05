import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MemoryEngine } from '@/lib/ai/memory-engine';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const memoryEngine = new MemoryEngine();
    const memories = await memoryEngine.getMemories(user.id, limit);

    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'key و value مطلوبان' }, { status: 400 });
    }

    const memoryEngine = new MemoryEngine();
    await memoryEngine.saveMemory(user.id, key, value);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    }

    const memoryEngine = new MemoryEngine();
    await memoryEngine.deleteMemory(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
