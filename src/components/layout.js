import React from "react"

export default ({ title, children }) => (
  <div className="max-w-screen-md mx-auto px-6">
    <h1 className="font-display uppercase">{ title }</h1>
    {children}
  </div>
)
