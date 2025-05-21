import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { createChannelController, getChannelListController, getMessageFromChannelController, sendMessageController } from "../controllers/channel.controller.js"
import isWorkspaceMembersMiddleware from "../middlewares/isWorkspaceMembers.middleware.js"

const channelRouter = express.Router()

channelRouter.use(authMiddleware)
channelRouter.post("/:workspace_id", isWorkspaceMembersMiddleware, createChannelController)
channelRouter.get("/:workspace_id", isWorkspaceMembersMiddleware, getChannelListController)
channelRouter.post("/:workspace_id/:channel_id/send-message", isWorkspaceMembersMiddleware, sendMessageController)
channelRouter.get("/:workspace_id/:channel_id", isWorkspaceMembersMiddleware, getMessageFromChannelController)

export default channelRouter