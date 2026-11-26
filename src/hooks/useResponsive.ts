import { DimensionValue, ViewStyle, useWindowDimensions } from 'react-native';

export interface ResponsiveModalStyles {
  isDialog: boolean;
  overlayStyle: ViewStyle;
  containerStyle: ViewStyle;
}

export interface ModalLayoutOptions {
  /** Max dialog width on tablet/desktop viewports (defaults to 640) */
  maxWidth?: number;
  /** Give the modal a fixed percentage height so flex ScrollViews scroll cleanly */
  fixedHeight?: boolean;
  /** Optional mobile height ratio percentage, e.g. '92%' */
  mobileHeight?: DimensionValue;
  /** Optional desktop height ratio percentage, e.g. '88%' */
  desktopHeight?: DimensionValue;
  /** Make modal fill screen height on compact mobile screens (< 768px) */
  fullScreenOnMobile?: boolean;
}

export const BREAKPOINTS = {
  COMPACT_PHONE: 390,
  MOBILE_MAX: 767,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE_DESKTOP: 1280,
  MAX_SHELL_WIDTH: 1200,
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isCompactPhone = width < BREAKPOINTS.COMPACT_PHONE;
  const isMobile = width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const isDesktop = width >= BREAKPOINTS.DESKTOP;
  const isWideDesktop = width >= BREAKPOINTS.WIDE_DESKTOP;
  const isTabletOrDesktop = width >= BREAKPOINTS.TABLET;
  const isSplitDesktop = width >= 900;

  const horizontalPadding = isDesktop ? 24 : isTablet ? 20 : isCompactPhone ? 10 : 14;
  const gridColumns = width >= 1160 ? 3 : width >= 720 ? 2 : 1;
  const dashboardTwoCol = isSplitDesktop;

  const shellStyle: ViewStyle = isTabletOrDesktop
    ? {
        width: '100%',
        maxWidth: BREAKPOINTS.MAX_SHELL_WIDTH,
        alignSelf: 'center',
      }
    : {
        width: '100%',
      };

  const getGridItemWidth = (desktopCols = 2, tabletCols = 2): DimensionValue => {
    const cols = isDesktop ? desktopCols : isTablet ? tabletCols : 1;
    if (cols >= 4) return '23.8%';
    if (cols === 3) return '32.2%';
    if (cols === 2) return '48.9%';
    return '100%';
  };

  const getModalStyles = (options: ModalLayoutOptions = {}): ResponsiveModalStyles => {
    const {
      maxWidth = 640,
      fixedHeight = false,
      mobileHeight = '92%',
      desktopHeight = '88%',
      fullScreenOnMobile = false,
    } = options;

    if (isTabletOrDesktop) {
      return {
        isDialog: true,
        overlayStyle: {
          flex: 1,
          backgroundColor: 'rgba(2, 6, 23, 0.72)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        containerStyle: {
          width: '100%',
          maxWidth,
          maxHeight: '92%',
          ...(fixedHeight ? { height: desktopHeight } : {}),
          borderRadius: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 24 },
          shadowOpacity: 0.35,
          shadowRadius: 36,
          elevation: 24,
        },
      };
    }

    if (fullScreenOnMobile) {
      return {
        isDialog: false,
        overlayStyle: {
          flex: 1,
          backgroundColor: '#020617',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        },
        containerStyle: {
          flex: 1,
          width: '100%',
          maxWidth: '100%',
          borderRadius: 0,
          overflow: 'hidden',
        },
      };
    }

    return {
      isDialog: false,
      overlayStyle: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.65)',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
      },
      containerStyle: {
        width: '100%',
        maxWidth: '100%',
        maxHeight: '92%',
        ...(fixedHeight ? { height: mobileHeight } : {}),
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
      },
    };
  };

  return {
    width,
    height,
    isCompactPhone,
    isMobile,
    isTablet,
    isDesktop,
    isWideDesktop,
    isTabletOrDesktop,
    isSplitDesktop,
    horizontalPadding,
    gridColumns,
    dashboardTwoCol,
    shellMaxWidth: BREAKPOINTS.MAX_SHELL_WIDTH,
    shellStyle,
    getGridItemWidth,
    getModalStyles,
  };
}
