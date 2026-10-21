import type { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(request: Request, response: Response) {
  response.status(201).json(await authService.register(request.body));
}

export async function login(request: Request, response: Response) {
  response.status(200).json(await authService.login(request.body));
}

export function me(request: Request, response: Response) {
  response.status(200).json(request.user);
}
