import { readerImageResponse } from "@/lib/reader-image-response";

export const dynamic = "force-dynamic";

type ImageContext = { params: Promise<{ filename: string }> };

export async function GET(request: Request, { params }: ImageContext) {
  return readerImageResponse(request, (await params).filename);
}

export const HEAD = GET;
