import type { Request, Response } from "express";
import * as historyService from "./service.js";
import { getUser } from "../../middleware/auth.js";
import {
  buildPaginationMeta,
  parsePagination,
  sendSuccess,
} from "../../utils/response.js";

export async function list(request: Request, response: Response) {
  const authenticatedUser = getUser(request);
  const { requestedPage, requestedLimit } = parsePagination(
    request.query as Record<string, unknown>,
  );
  const { historyRows, totalHistoryCount } = await historyService.listHistory(
    requestedPage,
    requestedLimit,
    authenticatedUser,
  );
  sendSuccess(
    response,
    historyRows,
    "History retrieved",
    buildPaginationMeta(totalHistoryCount, requestedPage, requestedLimit),
  );
}
