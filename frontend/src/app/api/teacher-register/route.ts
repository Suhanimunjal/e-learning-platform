import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBaseUrl) {
      return NextResponse.json(
        { message: 'API URL is not configured. Set NEXT_PUBLIC_API_URL.' },
        { status: 500 },
      );
    }

    const incoming = await request.formData();
    const outbound = new FormData();

    const name = incoming.get('name');
    const email = incoming.get('email');
    const phone = incoming.get('phone');
    const organizationName = incoming.get('organizationName');
    const expertise = incoming.get('expertise');
    const password = incoming.get('password');
    const idProof = incoming.get('idProof');

    if (!name || !email || !phone || !organizationName || !expertise || !password || !idProof) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    if (typeof idProof === 'string') {
      return NextResponse.json({ message: 'Invalid ID proof upload.' }, { status: 400 });
    }

    outbound.append('name', String(name));
    outbound.append('email', String(email));
    outbound.append('phone', String(phone));
    outbound.append('organizationName', String(organizationName));
    outbound.append('expertise', String(expertise));
    outbound.append('password', String(password));
    outbound.append('idProof', idProof, (idProof as { name?: string }).name ?? 'id-proof');

    const response = await fetch(`${apiBaseUrl}/auth/register-teacher`, {
      method: 'POST',
      body: outbound,
    });

    const data = await response.json().catch(() => ({ message: 'Unexpected response from backend.' }));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'Unable to reach backend service.' }, { status: 502 });
  }
}
