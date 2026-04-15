import * as React from "react";
import { MessageBar, MessageBarType, } from '@fluentui/react';

export interface IGeneralMessageBarProps {
    display: boolean;
    type:MessageBarType;
    message:string;

}

export default class GeneralMessageBar extends React.Component<IGeneralMessageBarProps> {    
    public render():JSX.Element{
        return(
            <div>
                {(this.props.display) && 
                    <MessageBar 
                        messageBarType={this.props.type} 
                        isMultiline={false}
                    >
                        {this.props.message}
                    </MessageBar>
                }
            </div>
        );
    }
}