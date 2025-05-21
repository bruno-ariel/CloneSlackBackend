import Channel from "../models/Channel.model.js"
import Message from "../models/Message.model.js"
import Workspace from "../models/Workspace.model.js"

export const createChannelController = async (req, res) => {
    try{
        const {id} = req.user
        const {workspace_id} = req.params
        const {name} = req.body
        
        const channel_created = await Channel.create({
            name,
            workspace: workspace_id,
            createBy: id
        })
        const channels = await Channel.find({workspace: workspace_id})
        .populate("createBy", "username email").populate("workspace", "name")
        //retomar hora 1:28 del video clase 24
        return res.json({
            ok: true,
            message: "Channel created",
            status: 201,
            data: {
                new_channel: channel_created,
                channels
            }
        })
    }
    catch (error){
        console.error(error);
        res.json({
            ok: false,  
            status: 500,
            message: "Internal server error",
        })
    } 
}

export const getChannelListController = async (req, res) => {
    try {
        const {id} = req.user
        const {workspace_id} = req.params
        const {workspace_selected} = req

        const channels = await Channel.find({workspace: workspace_id})
        return res.json({
            ok: true,
            message: "Channels found",
            status: 200,
            data: {
                channels : channels
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

export const sendMessageController = async (req, res) => {
    try {
        const {channel_id, workspace_id} = req.params
        const {content} = req.body
        const {id} = req.user

        const channel_selected = await Channel.findById(channel_id)
        if(!channel_selected){
            return res.json({
                ok: false,
                status: 404,
                message: "Channel not found"
            })
        }
        const new_message = await Message.create({
            channel: channel_id,
            sender: id,
            content
        })
        return res.json({
            ok: true,
            message: "Message sent",
            status: 201,
            data: {
                new_message
            }
        })
    }
    catch (error){
        console.error(error)
        res.json({
            ok: false,
            status: 500,
            message: "Internal server error",
        })
    }
}

export const getMessageFromChannelController = async (req, res) => {
    try {
        const {channel_id, workspace_id} = req.params
        const channel_selected = await Channel.findById(channel_id)
        if(!channel_selected){
            return res.json({
                ok: false,
                status: 404,
                message: "Channel not found"
            })
        }
        const messages = await Message.find({channel: channel_id})
        .populate("sender", "username")
        return res.json({
            ok: true,
            message: "Messages found",
            status: 200,
            data: {
                messages
            }
        })
    }
    catch (error){
        console.error(error)
        res.json({
            ok: false,
            status: 500,
            message: "Internal server error",
        })
    }
}