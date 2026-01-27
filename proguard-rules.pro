-keep class io.dcloud.** {
    *;
}

-keep class com.taobao.** {
    *;
}

 -optimizationpasses 5 -dontusemixedcaseclassnames -dontskipnonpubliclibraryclasses -dontskipnonpubliclibraryclassmembers -verbose
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** d(...);
    public static *** e(...);
}