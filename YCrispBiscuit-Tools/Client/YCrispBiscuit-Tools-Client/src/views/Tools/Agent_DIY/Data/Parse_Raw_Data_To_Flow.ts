import { position } from 'html2canvas/dist/types/css/property-descriptors/position';
import type { Agent_Team } from './Raw_Data';


export function parseRawDataToFlow(rawData: Agent_Team): any {
    const nodes: any[] = [];
    const edges: any[] = [];


    //Team节点位置
    const teamNodePosition = { x: 400, y: 200 };

    //Team节点
    nodes.push({
        id: rawData.component_type,
        label: "Team",
        type: "customNode",
        position: teamNodePosition,
        data: {
            provider: rawData.provider,
            component_type: rawData.component_type,
            version: rawData.version,
            description: rawData.description,
            label: rawData.label,
            participants: rawData.config.participants?.map(agent => ({
                name: agent.config.name,
                label: agent.label,
            }))
        }
    })


    //Agent节点
    const participants = rawData.config.participants || [];
    const agentCount = participants.length

    //节点在视图中的相对位置
    const verticalGap = 400
    const horizontalGap = 500
    const startY = 200 - ((agentCount - 1) * verticalGap) / 2
    const startX = 400 + horizontalGap

    participants.forEach((agent, index) => {
        //name唯一且不重复
        let Agent_Name = agent.config?.name
        if (!Agent_Name || Agent_Name === "") {
            Agent_Name = `Agent_${index + 1}`;
        };


        nodes.push({
            id: Agent_Name,
            label: agent.label,
            component_type: agent.component_type,
            version: agent.version,

            position: {
                x: startX,
                y: startY + index * verticalGap
            },
            data: {
                system_message: agent.config.system_message,
                description: agent.config.description,
                model_client: agent.config.model_client,
                workbench: agent.config.workbench,
                model_context: agent.config.model_context,
                tools: agent.config.tools
            }
        })



        //连接Team节点和Agent节点
        edges.push({
            //连接线的唯一ID
            id: `e-team-${Agent_Name}`,
            //连接线的源节点和目标节点
            source: rawData.component_type,
            target: Agent_Name,

            //连接线的样式
            //type: 'customEdge',

            //连接线的样式属性
            //animated: true,

            //连接线的标签
            label: ''
        });



    });

    return { nodes, edges }
}