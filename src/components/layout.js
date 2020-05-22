import React from "react"

export default ({ title, children }) => (
  <div className="max-w-screen-lg mx-auto px-6">
    <h1 className="mb-8 font-display uppercase">{ title }</h1>
    {children}
  </div>
)
