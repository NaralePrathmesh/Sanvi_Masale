import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// This file runs in its own process, so it can switch the storage provider before the app loads.
process.env.STORAGE_PROVIDER = 'cloudinary';
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123456789';
process.env.CLOUDINARY_API_SECRET = 'cloudinary-test-secret';
process.env.CLOUDINARY_FOLDER = 'saanvi-masale';
const { createUploadTicket, verifyUploaded } = await import('../src/services/storage.js');
const { prisma, redis } = await import('../src/lib/core.js');
after(async () => { await prisma.$disconnect(); await redis?.quit(); });

const sign = (s) => crypto.createHash('sha1').update(s + 'cloudinary-test-secret').digest('hex');

test('cloudinary: signed ticket is scoped to our folder, type and size', async () => {
  const t = await createUploadTicket({ folder: 'products', contentType: 'image/webp', bytes: 200_000 });
  assert.equal(t.provider, 'cloudinary');
  assert.equal(t.uploadUrl, 'https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
  assert.equal(t.fields.folder, 'saanvi-masale/products');
  const { api_key: _k, signature, ...params } = t.fields;
  assert.equal(signature, sign(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')));
  assert.equal(JSON.stringify(t).includes('cloudinary-test-secret'), false, 'secret never leaves the server');
  await assert.rejects(createUploadTicket({ folder: 'products', contentType: 'image/svg+xml', bytes: 10 }), /Only JPG/);
  await assert.rejects(createUploadTicket({ folder: 'products', contentType: 'image/png', bytes: 50 * 1024 * 1024 }), /smaller than/);
  assert.equal((await createUploadTicket({ folder: '../../etc', contentType: 'image/png', bytes: 10 })).fields.folder, 'saanvi-masale/misc');
});

test('cloudinary: only genuine upload responses for our account/folder are accepted', () => {
  const good = { public_id: 'saanvi-masale/products/abc', version: 1700000000, secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1700000000/saanvi-masale/products/abc.webp', bytes: 1000, width: 800, height: 1000, format: 'webp' };
  good.signature = sign(`public_id=${good.public_id}&version=${good.version}`);
  assert.equal(verifyUploaded(good).url, good.secure_url);
  assert.throws(() => verifyUploaded({ ...good, signature: 'f'.repeat(40) }), /signature/);
  const otherFolder = { ...good, public_id: 'someone-else/x' }; otherFolder.signature = sign(`public_id=${otherFolder.public_id}&version=${good.version}`);
  assert.throws(() => verifyUploaded(otherFolder), /folder/);
  const otherCloud = { ...good, secure_url: 'https://res.cloudinary.com/attacker/image/upload/x.webp' };
  assert.throws(() => verifyUploaded(otherCloud), /URL/);
});
