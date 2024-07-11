import React from "react"
import ContentLoader, { IContentLoaderProps } from "react-content-loader"

const TableSkeleton = (props: IContentLoaderProps) => (
  <ContentLoader
    className="animate-pulse py-4"
    speed={2}
    width={"100%"}
    height={582}
    // viewBox="0 0 520 265"
    backgroundColor="#f3f3f3"
    foregroundColor="#fcfbfb"
    {...props}
  >
    <rect x="0" y="9" rx="5" ry="5" width="114" height="40" /> 
    <rect x="125" y="9" rx="4" ry="5" width={`calc(100% - 172px)`} height="40" /> 
    <rect x={`calc(100% - 37px)`} y="9" rx="5" ry="5" width="37" height="40" /> 
    <rect x="0" y="72" rx="5" ry="5" width="100%" height="462" />
  </ContentLoader>
)

export default TableSkeleton

