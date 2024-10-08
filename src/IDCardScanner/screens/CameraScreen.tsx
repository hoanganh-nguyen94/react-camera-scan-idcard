import {useEffect, useState} from 'react';
import {Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import {
  Camera,
  CameraDevice,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useSharedValue} from 'react-native-worklets-core';
import {crop, CropRegion} from '../utils/CroperUtils';

export interface CameraScreenProps {
  route: any;
  navigation: any;
}

export default function CameraScreen(props: CameraScreenProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  // const device = useCameraDevice('front', {
  //   physicalDevices: ['wide-angle-camera'],
  // });
  const device: CameraDevice = useCameraDevice('front') as CameraDevice;
  const {width, height} = useWindowDimensions();
  const format = useCameraFormat(
    {...device, id: 'cameraId', sensorOrientation: 'landscape-left'},
    [
      {
        photoResolution: 'max',
        videoResolution: 'max',
      },
    ],
  );
  const [cropRegion, setCropRegion] = useState({
    left: 10,
    top: 20,
    width: 80,
    height: 30,
  });
  const cropRegionShared = useSharedValue<undefined | CropRegion>(undefined);
  const shouldTake = useSharedValue(false);
  const [pressed, setPressed] = useState(false);
  const capture = () => {
    shouldTake.value = true;
  };

  const adaptCropRegionForIDCard = () => {
    let size = getFrameSize();
    let regionWidth = 0.8 * size.width;
    let desiredRegionHeight = regionWidth / (85.6 / 54);
    let height = Math.ceil((desiredRegionHeight / size.height) * 100);
    let region = {
      left: 10,
      width: 80,
      top: 20,
      height: height,
    };
    setCropRegion(region);
    cropRegionShared.value = region;
  };

  const getViewBox = () => {
    const frameSize = getFrameSize();
    const viewBox = '0 0 ' + frameSize.width + ' ' + frameSize.height;
    return viewBox;
  };

  const getFrameSize = (): {width: number; height: number} => {
    let size = {width: 1080, height: 1920};
    return size;
  };

  const onCaptured = (base64: string) => {
    setIsActive(false);
    if (props) {
      if (props.navigation) {
        props.navigation.navigate({
          name: 'Card',
          params: {base64: base64},
          merge: true,
        });
      }
    }
  };

  const onCapturedJS = Worklets.createRunInJsFn(onCaptured);
  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    if (shouldTake.value == true && cropRegionShared.value != undefined) {
      shouldTake.value = false;
      const result = crop(frame, {
        cropRegion: cropRegion,
        includeImageBase64: true,
        // saveAsFile: false,
      });
      if (result.base64) {
        onCapturedJS(result.base64);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
      adaptCropRegionForIDCard();
    })();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {device != null && hasPermission && (
        <>
          <Camera
            style={[
              StyleSheet.absoluteFill,
              {
                width,
                // height,
                height: height,
              },
            ]}
            orientation={'landscape-left'}
            isActive={isActive}
            device={device}
            format={format}
            frameProcessor={frameProcessor}
            pixelFormat="yuv"
            photo
          />
          <Svg
            preserveAspectRatio="xMidYMid slice"
            style={StyleSheet.absoluteFill}
            viewBox={getViewBox()}>
            <Rect
              x={(cropRegion.left / 100) * getFrameSize().width}
              y={(cropRegion.top / 100) * getFrameSize().height}
              width={(cropRegion.width / 100) * getFrameSize().width}
              height={(cropRegion.height / 100) * getFrameSize().height}
              strokeWidth="2"
              stroke="red"
              fillOpacity={0.0}
            />
          </Svg>
        </>
      )}
      <View style={[styles.bottomBar]}>
        <Pressable
          onPressIn={() => {
            setPressed(true);
          }}
          onPressOut={() => {
            setPressed(false);
          }}
          onPress={() => {
            capture();
          }}>
          <View style={styles.outerCircle}>
            <View
              style={[
                styles.innerCircle,
                pressed ? styles.circlePressed : null,
              ]}></View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: 'lightgray',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: 'white',
  },
  circlePressed: {
    backgroundColor: 'lightgray',
  },
});
