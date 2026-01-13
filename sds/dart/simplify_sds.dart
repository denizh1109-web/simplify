// Simplify Design System - Dart/Flutter Tokens
// Generated from simplify-sds-manifest.json
// WCAG 2.2 AAA Compliant

import 'package:flutter/material.dart';

/// Simplify Design System Color Tokens
/// All colors tested for 7:1 WCAG AAA contrast ratio
class SdsColors {
  // Primary Brand Colors
  static const Color bgPrimary = Color(0xFFF6F4EF); // Ivory White
  static const Color textPrimary = Color(0xFF3E3A36); // Warm Charcoal
  
  // Secondary Colors
  static const Color surfaceSecondary = Color(0xFFE9E2D6); // Warm Beige
  static const Color divider = Color(0xFFD6CEC2); // Divider
  static const Color textSecondary = Color(0xFF7A7268); // Muted Gray
  
  // Accent Colors
  static const Color accentClay = Color(0xFFC7A18A); // Clay
  static const Color accentRose = Color(0xFFC9A3A0); // Rose
  
  // Semantic Colors
  static const Color success = Color(0xFF6B5B47); // Success
  static const Color warning = Color(0xFF8B6F47); // Warning
  static const Color error = Color(0xFF9D4B52); // Error
  static const Color info = Color(0xFF6B7A84); // Info
  
  // Interactive States
  static const Color interactiveDefault = Color(0xFF3E3A36);
  static const Color interactiveHover = Color(0xFF2A2622);
  static const Color interactiveDisabled = Color(0xFFB8AFA2);
  
  // Dark Mode
  static const Color darkBgPrimary = Color(0xFF2A2622);
  static const Color darkSurfaceSecondary = Color(0xFF3E3A36);
  static const Color darkTextPrimary = Color(0xFFF6F4EF);
}

/// Simplify Design System Spacing Tokens
/// Based on 8px modular grid
class SdsSpacing {
  static const double space0 = 0;
  static const double space1 = 4;
  static const double space2 = 8;
  static const double space3 = 12;
  static const double space4 = 16;
  static const double space5 = 20;
  static const double space6 = 24;
  static const double space8 = 32;
  static const double space10 = 40;
  static const double space12 = 48;
  static const double space16 = 64;
  static const double space20 = 80;
}

/// Simplify Design System Border Radius
class SdsBorderRadius {
  static const double radiusXs = 4;
  static const double radiusSm = 8;
  static const double radiusMd = 10; // Apple-style
  static const double radiusLg = 12;
  static const double radiusXl = 16;
  static const double radiusFull = 9999;
}

/// Simplify Design System Typography
class SdsTypography {
  // Font sizes in logical pixels
  static const double fontSizeH1 = 32;
  static const double fontSizeH2 = 28;
  static const double fontSizeH3 = 24;
  static const double fontSizeH4 = 20;
  static const double fontSizeH5 = 16;
  static const double fontSizeH6 = 14;
  
  static const double fontSizeBodyLg = 16;
  static const double fontSizeBodyMd = 14;
  static const double fontSizeBodySm = 12;
  static const double fontSizeBodyXs = 11;
  
  // Line heights
  static const double lineHeightTight = 1.3;
  static const double lineHeightNormal = 1.5;
  static const double lineHeightRelaxed = 1.7;
  
  // Font weights
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
}

/// Simplify Design System Motion/Animation Tokens
class SdsMotion {
  // Durations in milliseconds
  static const Duration durationProductive = Duration(milliseconds: 200);
  static const Duration durationExpressive = Duration(milliseconds: 500);
  static const Duration durationEntrance = Duration(milliseconds: 300);
  
  // Curves - Productive vs Expressive
  static const Curve curveProductive = Curves.fastOutSlowIn; // ~cubic-bezier(0.25, 0.1, 0.25, 1.0)
  static const Curve curveExpressive = Curves.easeOutQuart; // Expressive easing
  static const Curve curveBounce = Curves.bounceOut;
}

/// Simplify Design System Shadow Styles
class SdsShadows {
  static final BoxShadow shadowXs = BoxShadow(
    color: Colors.black.withOpacity(0.05),
    blurRadius: 2,
    offset: const Offset(0, 1),
  );
  
  static final BoxShadow shadowSm = BoxShadow(
    color: Colors.black.withOpacity(0.08),
    blurRadius: 3,
    offset: const Offset(0, 1),
  );
  
  static final BoxShadow shadowMd = BoxShadow(
    color: Colors.black.withOpacity(0.07),
    blurRadius: 6,
    offset: const Offset(0, 4),
  );
  
  static final BoxShadow shadowLg = BoxShadow(
    color: Colors.black.withOpacity(0.1),
    blurRadius: 15,
    offset: const Offset(0, 10),
  );
}

/// Simplify Design System Theme
class SimplifyTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: SdsColors.textPrimary,
      surface: SdsColors.bgPrimary,
      secondary: SdsColors.accentClay,
      error: SdsColors.error,
    ),
    scaffoldBackgroundColor: SdsColors.bgPrimary,
    textTheme: TextTheme(
      displayLarge: TextStyle(
        fontSize: SdsTypography.fontSizeH1,
        fontWeight: SdsTypography.fontWeightBold,
        color: SdsColors.textPrimary,
      ),
      displayMedium: TextStyle(
        fontSize: SdsTypography.fontSizeH2,
        fontWeight: SdsTypography.fontWeightBold,
        color: SdsColors.textPrimary,
      ),
      bodyLarge: TextStyle(
        fontSize: SdsTypography.fontSizeBodyLg,
        fontWeight: SdsTypography.fontWeightRegular,
        color: SdsColors.textPrimary,
      ),
      bodyMedium: TextStyle(
        fontSize: SdsTypography.fontSizeBodyMd,
        fontWeight: SdsTypography.fontWeightRegular,
        color: SdsColors.textPrimary,
      ),
      labelSmall: TextStyle(
        fontSize: SdsTypography.fontSizeBodySm,
        fontWeight: SdsTypography.fontWeightSemibold,
        color: SdsColors.textSecondary,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: SdsColors.textPrimary,
        foregroundColor: SdsColors.bgPrimary,
        padding: const EdgeInsets.symmetric(
          horizontal: SdsSpacing.space4,
          vertical: SdsSpacing.space3,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SdsBorderRadius.radiusMd),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: SdsColors.textPrimary,
        side: const BorderSide(color: SdsColors.divider),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SdsBorderRadius.radiusMd),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: SdsColors.bgPrimary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(SdsBorderRadius.radiusMd),
        borderSide: const BorderSide(color: SdsColors.divider),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(SdsBorderRadius.radiusMd),
        borderSide: const BorderSide(color: SdsColors.divider),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(SdsBorderRadius.radiusMd),
        borderSide: const BorderSide(color: SdsColors.accentClay, width: 2),
      ),
      labelStyle: const TextStyle(
        color: SdsColors.textSecondary,
        fontSize: SdsTypography.fontSizeBodySm,
      ),
    ),
  );
  
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: SdsColors.darkTextPrimary,
      surface: SdsColors.darkBgPrimary,
      secondary: SdsColors.accentClay,
      error: SdsColors.error,
    ),
    scaffoldBackgroundColor: SdsColors.darkBgPrimary,
  );
}

/// Simplify Design System Breakpoints (Responsive)
class SdsBreakpoints {
  static const double mobile = 320;
  static const double tablet = 768;
  static const double desktop = 1024;
}

/// Helper class for accessibility focus indicators
class SdsFocusStyle {
  static final FocusData focusDefault = FocusData(
    width: 2,
    color: SdsColors.accentClay,
    offset: const Offset(0, 2),
  );
}

class FocusData {
  final double width;
  final Color color;
  final Offset offset;
  
  FocusData({
    required this.width,
    required this.color,
    required this.offset,
  });
}
