import Workspace from "../models/Workspace.model.js"

const isWorkspaceMembersMiddleware = async (req, res, next) => {
    try {
        const { id } = req.user
        const { workspace_id } = req.params
        const workspace_selected = await Workspace.findById(workspace_id)
        if (!workspace_selected) {
            return res.json({
                status: 404,
                ok: false,
                message: "Workspace not found"
            })
        }
        if (!workspace_selected.members.includes(id)) {
            return res.json({
                status: 403,
                ok: false,
                message: "U are not a member of this workspace"
            })
        }
        req.workspace_selected = workspace_selected
        return next()
    }
    catch (error) {
        console.error(error)
        res.json({
            ok: false,
            status: 500,
            message: "Internal server error",
        })
    }
}

export default isWorkspaceMembersMiddleware