import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { createWorkspaceController, getWorkspaceController, inviteUserToWorkspaceController } from "../controllers/workspace.controller.js"

const workspaceRouter = express.Router()

workspaceRouter.post("/", authMiddleware, createWorkspaceController)
workspaceRouter.post("/:workspace_id/invite", authMiddleware, inviteUserToWorkspaceController)
workspaceRouter.get("/", authMiddleware, getWorkspaceController)

export default workspaceRouter