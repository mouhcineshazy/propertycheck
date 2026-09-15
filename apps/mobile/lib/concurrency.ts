/**
 * Run an async mapper over items with a bounded number of workers in flight.
 *
 * Photo work (uploads, PDF image inlining) is I/O-bound: doing it one-at-a-time
 * is needlessly slow, but firing all of it at once saturates the socket and
 * spikes memory (many base64 blobs resident simultaneously). A small fixed pool
 * is the right middle ground. Results preserve input order.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}
