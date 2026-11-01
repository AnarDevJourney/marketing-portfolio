import type { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import { BuildHookService } from './build-hook.service.js';

const config = (url?: string) =>
  ({ get: () => url }) as unknown as ConfigService<Env, true>;

describe('BuildHookService', () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(null)));

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('debounces several edits into one POST', async () => {
    const hook = new BuildHookService(config('https://api.netlify.com/hook'));
    hook.schedule();
    await vi.advanceTimersByTimeAsync(60_000);
    hook.schedule();
    hook.schedule();
    expect(fetchMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(120_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.netlify.com/hook',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('does nothing without a hook URL', async () => {
    new BuildHookService(config(undefined)).schedule();
    await vi.advanceTimersByTimeAsync(300_000);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
