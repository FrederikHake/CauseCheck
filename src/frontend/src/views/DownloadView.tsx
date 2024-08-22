import React from "react";
import LogDownload from "../components/DownloadLog";
import PageWrapper from "../components/PageWrapper";

const DownloadView: React.FC = () => {
  return (
    <PageWrapper title="Everything is finished: Please download your log here" prevPath="/noise" >
      <LogDownload />
    </PageWrapper>
  );
};

export default DownloadView;
