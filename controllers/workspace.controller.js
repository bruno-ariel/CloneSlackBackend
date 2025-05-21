import User from "../models/User.model.js"
import Workspace from "../models/Workspace.model.js"

export const createWorkspaceController = async (req, res) => {
    try {
        const {name} = req.body
        const {id} = req.user
        const new_worspace = await Workspace.create({
            name,
            owner: id,
            members: [id] //Agrego el propietario al workspace
        })
        res.json({
            ok: true,
            message: "Workspace created",
            status: 201,
            data: {
                new_worspace
            }
        })
    }
    catch (error) {
        console.error(error);
        res.json({
            ok: false,  
            status: 500,
            message: "Internal server error",
        })
    }
}

export const inviteUserToWorkspaceController = async (req, res) => {
    try{
        const {id} = req.user
        const {workspace_id} = req.params
        const {email} = req.body

        const workspace_selected = await Workspace.findById(workspace_id)
        if(!workspace_selected){
            return res.json({
                ok: false,
                status: 404,
                message: "Workspace not found"
            })
        }
        if(!workspace_selected.owner.equals(id)){
            return res.json({
                ok: false,
                status: 403,
                message: "Forbidden"
            })
        }
        const user_invited = await User.findOne({email})
        if(!user_invited){
            return res.json({
                ok: false,
                status: 404,
                message: "User not found"
            })
        }
        if(workspace_selected.members.includes(user_invited._id)){
            return res.json({
                ok: false,
                status: 200,
                message: "User already invited"
            })
        }
        workspace_selected.members.push(user_invited._id)
        await workspace_selected.save()
        return res.json({
            ok: true,
            status: 200,
            message: "User invited"
        })
    }
    catch (error) {
        console.error(error);
        res.json({
            ok: false,  
            status: 500,
            message: "Internal server error",
        })
    }
}

export const getWorkspaceController = async (req, res) => {
    try {
        const {id} = req.user 

        const workspaces = await Workspace.find({members: id})
        .populate("members", "username email")
        .populate("owner", "username")

        res.json({
            ok: true,
            message: "Workspaces found",
            status: 200,
            data: {
                workspaces
            }
        })
    }
    catch (error) {
        console.error(error);
        res.json({
            ok: false,  
            status: 500,
            message: "Internal server error",
        })
    }
}