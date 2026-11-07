!macro customInstall
  !ifdef MENU_FILENAME
    CreateDirectory "$SMPROGRAMS\${MENU_FILENAME}"
  !endif

  Delete "$newStartMenuLink"
  CreateShortCut "$newStartMenuLink" "$appExe" "" "$INSTDIR\resources\ulleds-icon-${VERSION}.ico" 0 "" "" "${APP_DESCRIPTION}"
  WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"

  ${ifNot} ${isNoDesktopShortcut}
    Delete "$newDesktopLink"
    CreateShortCut "$newDesktopLink" "$appExe" "" "$INSTDIR\resources\ulleds-icon-${VERSION}.ico" 0 "" "" "${APP_DESCRIPTION}"
    WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
  ${endIf}

  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
