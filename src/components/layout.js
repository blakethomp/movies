import React from "react"

export default ({ title, children }) => (
  <div className="mx-auto px-6 max-w-screen-lg">
    <h1 className="mb-8 font-display uppercase">{ title }</h1>
    {children}
  </div>
)
