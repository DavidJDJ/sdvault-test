import * as React from "react";
import { ActivityItem, Link, Icon } from '@fluentui/react';
import { getFileTypeIconProps, FileIconType, initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "./GeneralActivityItem.module.scss";

initializeFileTypeIcons();

export interface IGeneralActivityItemProps {
    key: any;
    context: WebPartContext
    urlDocumento: string;
    nombreDocumento: string;
}

export default class GeneralActivityItem extends React.Component<IGeneralActivityItemProps> {

    private getIcon = (documentName: string): any => {
        const parts = documentName.split(".");
        const type = parts[parts.length - 1];
        let iconName;
        switch (type) {
            case "docx":
                iconName = <Icon {...getFileTypeIconProps({ extension: 'docx', size: 32, imageFileType: 'png' })} />;
                break;
            case "xlsx":
                iconName = <Icon {...getFileTypeIconProps({ extension: 'xlsx', size: 32, imageFileType: 'png' })} />;
                break;
            case "pptx":
                iconName = <Icon {...getFileTypeIconProps({ extension: 'pptx', size: 32, imageFileType: 'png' })} />;
                break;
            case "pdf":
                iconName = <Icon {...getFileTypeIconProps({ extension: 'pdf', size: 32, imageFileType: 'png' })} />;
                break;
            default:
                iconName = <Icon {...getFileTypeIconProps({ type: FileIconType.genericFile, size: 32, imageFileType: 'svg' })} />;
                break;
        }
        return iconName;
    }

    public render(): JSX.Element {
        return (
            <div>
                <ActivityItem
                    key={this.props.key}
                    activityDescription={[
                        <Link
                            key={this.props.key}
                            className={styles.linkFile}
                            href={`${this.props.context.pageContext.web.absoluteUrl}/_layouts/download.aspx?SourceUrl=${this.props.urlDocumento}`}
                            target="_blank"
                        >
                            {this.props.nombreDocumento}
                        </Link>
                    ]}
                    activityIcon={this.getIcon(this.props.nombreDocumento)}
                    className={styles.activityItem}
                />
            </div>
        );
    }
}