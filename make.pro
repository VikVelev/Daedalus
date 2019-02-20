CONFIG *= qt debug
HEADERS *= src/headers/core.h
SOURCES = src/main.cpp \
          src/core.cpp
TARGET = build/Daedalus
LIBS *= #libs here

QT += qml
TEMPLATE = app

#Platform specific stuff
win32 {
    debug {
        message("")
        message("============================")        
        message("Running on a Windows system.")
        message("============================")
        message("")    
    }
}

unix {
    debug {
        message("")
        message("============================")
        message("Running on Unix/GNU system.")
        message("============================")
        message("") 
    }
}

!exists(src/*) {
    error("Error, src folder doesn't exist. Contact Viktor Velev for assitance.")
}