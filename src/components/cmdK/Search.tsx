import React, { forwardRef, Fragment, Ref } from "react";
import { RxMagnifyingGlass } from "react-icons/rx";
import { HiXCircle } from "react-icons/hi";

interface SearchProps {
    onChange: (value: string) => void;
    placeholder?: string;
    prefix?: string[];
    value: string;
}

function Search(
    { onChange, placeholder, prefix, value }: SearchProps,
    ref: Ref<HTMLInputElement>
) {
    return (
        <div className="flex items-center space-x-1.5 pl-3">
            <RxMagnifyingGlass className="w-4 pointer-events-none text-neutral-400 dark:text-neutral-600" />

            {prefix?.length
                ? prefix.map((p) => {
                      return (
                          <Fragment key={p}>
                              <span className="text-white">{p}</span>
                              <span className="text-gray-500">/</span>
                          </Fragment>
                      );
                  })
                : null}

            <div className="flex-1 relative">
                <input
                    ref={ref}
                    spellCheck={false}
                    className="py-4 px-0 border-none w-full focus:outline-none focus:border-none focus:ring-0 bg-transparent placeholder-neutral-500 text-white"
                    onChange={(e) => {
                        onChange(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                        e.currentTarget.select();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape" && value) {
                            e.preventDefault();
                            e.stopPropagation();
                            onChange("");
                        }
                    }}
                    id="command-palette-search-input"
                    placeholder={placeholder}
                    value={value}
                    type="text"
                    autoFocus
                />

                {value && (
                    <button
                        tabIndex={-1}
                        type="button"
                        onClick={() => {
                            onChange("");
                            const inputElement = document.getElementById(
                                "command-palette-search-input"
                            );
                            if (inputElement) {
                                inputElement.focus();
                            }
                        }}
                    >
                        <HiXCircle className="w-5 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 transition absolute right-3 top-1/2 transform -translate-y-1/2" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default forwardRef(Search);
