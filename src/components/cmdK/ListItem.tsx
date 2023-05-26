import React, {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    DetailedHTMLProps,
    FC,
    Fragment,
    ReactNode,
    useContext,
} from "react";
import { RenderLink } from "./types";
import { OpenContext, RenderLinkContext, SelectContext } from "./lib/context";
import { classNames } from "./lib/utils";
import { IconType } from "react-icons";

export type ListItemType = "Link" | "Action";

function getListItemWrapperStyles(selected: boolean, disabled?: boolean) {
    return classNames(
        "command-palette-list-item block w-full text-left px-3.5 py-2.5 rounded-md hover:bg-neutral-200/5 focus:ring-1 focus:ring-neutral-300 focus:outline-none flex items-center space-x-2.5 justify-between",
        selected && !disabled ? "bg-neutral-200/5" : "bg-transparent",
        disabled
            ? "cursor-default pointer-events-none opacity-50"
            : "cursor-pointer"
    );
}

interface ListItemBaseProps {
    closeOnSelect?: boolean;
    icon?: IconType;
    showType?: boolean;
    disabled?: boolean;
    keywords?: string[];
    index: number;
    typeString?: string;
}

export interface LinkProps
    extends ListItemBaseProps,
        DetailedHTMLProps<
            AnchorHTMLAttributes<HTMLAnchorElement>,
            HTMLAnchorElement
        > {
    renderLink?: RenderLink;
}

export function Link({
    renderLink: localRenderLink,
    closeOnSelect = true,
    disabled = false,
    showType = true,
    typeString,
    className,
    children,
    onClick,
    index,
    icon,
    ...rest
}: LinkProps) {
    const { renderLink: globalRenderLink } = useContext(RenderLinkContext);
    const { onChangeOpen } = useContext(OpenContext);
    const { selected } = useContext(SelectContext);

    const renderLink = localRenderLink || globalRenderLink;

    function renderLinkContent() {
        return (
            <ListItemContent type={typeString} icon={icon}>
                {children}
            </ListItemContent>
        );
    }

    const styles = classNames(
        getListItemWrapperStyles(selected === index, disabled),
        className
    );

    function clickAndClose(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        if (rest.href && !disabled) {
            if (onClick) {
                onClick(e);
            }

            if (closeOnSelect) {
                onChangeOpen(false);
            }
        }
    }

    return renderLink ? (
        <Fragment>
            {renderLink({
                ...rest,
                "data-close-on-select": closeOnSelect,
                children: renderLinkContent(),
                "aria-disabled": disabled,
                onClick: clickAndClose,
                className: styles,
            })}
        </Fragment>
    ) : (
        <a
            {...rest}
            data-close-on-select={closeOnSelect}
            aria-disabled={disabled}
            onClick={clickAndClose}
            className={styles}
        >
            {renderLinkContent()}
        </a>
    );
}

export interface ButtonProps
    extends ListItemBaseProps,
        DetailedHTMLProps<
            ButtonHTMLAttributes<HTMLButtonElement>,
            HTMLButtonElement
        > {}

export function Button({
    closeOnSelect = true,
    showType = true,
    className,
    children,
    onClick,
    typeString,
    index,
    icon,
    ...rest
}: ButtonProps) {
    const { selected } = useContext(SelectContext);
    const { onChangeOpen } = useContext(OpenContext);

    function clickAndClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (onClick) {
            onClick(e);

            if (closeOnSelect) {
                onChangeOpen(false);
            }
        }
    }

    return (
        <button
            {...rest}
            aria-disabled={rest.disabled ?? false}
            data-close-on-select={closeOnSelect}
            onClick={clickAndClose}
            className={classNames(
                getListItemWrapperStyles(selected === index, rest.disabled),
                className
            )}
        >
            <ListItemContent type={typeString} icon={icon}>
                {children}
            </ListItemContent>
        </button>
    );
}

interface ListItemContentProps {
    icon?: FC<any>;
    children: ReactNode;
    type?: ListItemType | string;
}

function ListItemContent({
    icon: ListItemIcon,
    children,
    type,
}: ListItemContentProps) {
    return (
        <>
            <div className="flex items-center space-x-2.5">
                {ListItemIcon && (
                    <ListItemIcon className="w-5 h-5 text-neutral-500" />
                )}
                {typeof children === "string" ? (
                    <span className="truncate max-w-md dark:text-white">
                        {children}
                    </span>
                ) : (
                    children
                )}
            </div>

            {type && <span className="text-neutral-500 text-sm">{type}</span>}
        </>
    );
}

export default function ListItem(props: ButtonProps & LinkProps) {
    const Wrapper = props.href ? Link : Button;

    return <Wrapper {...props} />;
}
