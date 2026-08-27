import { apiSuccess, apiError } from '../lib/api/response';
import { AppError } from '../lib/errors/app-error';

export async function testApiResponse(): Promise<boolean> {
  console.log('🧪 Testing API Response Envelopes & Errors...');

  // Test Success Response
  const successRes = apiSuccess({ sample: 'data' }, { requestId: 'req_test_123' });
  const successJson = await successRes.json();

  if (!successJson.success || successJson.data.sample !== 'data' || successJson.meta.requestId !== 'req_test_123') {
    console.error('❌ Success envelope format mismatch:', successJson);
    return false;
  }

  // Test Error Response
  const errorObj = new AppError({
    code: 'NOT_FOUND',
    message: 'Question not found',
    statusCode: 404,
    requestId: 'req_err_456',
  });

  const errorRes = apiError(errorObj);
  const errorJson = await errorRes.json();

  if (errorJson.success !== false || errorJson.error.code !== 'NOT_FOUND' || errorRes.status !== 404) {
    console.error('❌ Error envelope format mismatch:', errorJson);
    return false;
  }

  console.log('✅ API Response Envelope Tests Passed.');
  return true;
}
