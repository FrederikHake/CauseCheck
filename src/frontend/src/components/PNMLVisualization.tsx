import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { axiosInstance } from '../queryClient';
import { CircularProgress } from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface PNMLVisualizationProps { 
  isLoaded: boolean;

}

const PNMLVisualization: React.FC<PNMLVisualizationProps> = (isLoaded) => {
  const [svgContent, setSvgContent] = useState<string>('');
  let [loadingImg] = useState<boolean>(false);

  const fetchImage = async (): Promise<string> => {
    
    const response = await axiosInstance.get('/visualization', {
      withCredentials: true,
      responseType: 'text'
    });
    if (response.status !== 200) {
      throw new Error('Failed to fetch image');
    }
    return response.data; // Return SVG content directly
  };

  const {mutate: mutation, isLoading: loadImg,isError:isError} = useMutation(fetchImage, {
    onSuccess: (data) => {
      setSvgContent(data);
      loadingImg = false;
    }
  });

  useEffect(() => {
    if (isLoaded.isLoaded && !loadImg && !loadingImg) {
      loadingImg = true;
      mutation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]); // This effect runs only once
  if (loadingImg) {
    return <CircularProgress />;
  }

  if (isError) {
    return <div>Error loading image</div>;
  }

  return (
    <div style={{ paddingBottom: '200px', border: '3px solid #ccc', padding: '10px', borderRadius: '15px', overflow: 'hidden' }}>
      <div>
        <button style={{ color: 'white', backgroundColor: '#228EE1', border: '1px solid gray', margin: '3px' }} onClick={() => document.getElementById('zoomIn')?.click()}>Zoom In</button>
        <button style={{ color: 'white', backgroundColor: '#228EE1', border: '1px solid gray', margin: '3px' }} onClick={() => document.getElementById('zoomOut')?.click()}>Zoom Out</button>
        <button style={{ color: 'white', backgroundColor: '#228EE1', border: '1px solid gray', margin: '3px' }} onClick={() => document.getElementById('reset')?.click()}>Fit to Viewer</button>
      </div>
      <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <TransformWrapper
          initialScale={1}
          initialPositionX={200}
          initialPositionY={100}
        >
          {({ zoomIn, zoomOut, resetTransform }: { zoomIn: any; zoomOut: any; resetTransform: any }) => (
            <>
              <div style={{ display: 'none' }}>
                <button id="zoomIn" onClick={() => zoomIn()}>Zoom In</button>
                <button id="zoomOut" onClick={() => zoomOut()}>Zoom Out</button>
                <button id="reset" onClick={() => resetTransform()}>Fit to Viewer</button>
              </div>
              <TransformComponent wrapperStyle={{
                width: '100vh'
              }}>
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
};

export default PNMLVisualization;
