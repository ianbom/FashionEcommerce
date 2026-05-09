#10 752.8 + strip --strip-all modules/opcache.so
#10 752.8 make: Circular jit/zend_jit.lo <- jit/zend_jit.lo dependency dropped.
#10 752.8 Installing shared extensions:     /usr/local/lib/php/extensions/no-debug-non-zts-20230831/  
#10 752.9 find . -name \*.gcno -o -name \*.gcda | xargs rm -f
#10 752.9 find . -name \*.lo -o -name \*.o -o -name \*.dep | xargs rm -f
#10 752.9 find . -name \*.la -o -name \*.a | xargs rm -f
#10 752.9 find . -name \*.so | xargs rm -f
#10 752.9 find . -name .libs -a -type d|xargs rm -rf
#10 753.0 rm -f libphp.la      modules/* libs/*
#10 753.0 rm -f ext/opcache/jit/zend_jit_x86.c
#10 753.0 rm -f ext/opcache/jit/zend_jit_arm64.c
#10 753.0 rm -f ext/opcache/minilua
#10 753.0 Configuring for:
#10 753.0 PHP Api Version:         20230831
#10 753.0 Zend Module Api No:      20230831
#10 753.0 Zend Extension Api No:   420230831
#10 753.9 checking for grep that handles long lines and -e... /bin/grep
#10 753.9 checking for egrep... /bin/grep -E
#10 753.9 checking for a sed that does not truncate output... /bin/sed
#10 753.9 checking for pkg-config... /usr/bin/pkg-config
#10 753.9 checking pkg-config is at least version 0.9.0... yes
#10 753.9 checking for cc... cc
#10 754.0 checking whether the C compiler works... yes
#10 754.0 checking for C compiler default output file name... a.out
#10 754.0 checking for suffix of executables...
#10 754.0 checking whether we are cross compiling... no
#10 754.1 checking for suffix of object files... o
#10 754.1 checking whether the compiler supports GNU C... yes
#10 754.1 checking whether cc accepts -g... yes
#10 754.2 checking for cc option to enable C11 features... none needed
#10 754.2 checking how to run the C preprocessor... cc -E
#10 754.3 checking for egrep -e... (cached) /bin/grep -E
#10 754.3 checking for icc... no
#10 754.3 checking for suncc... no
#10 754.3 checking for system library directory... lib
#10 754.3 checking if compiler supports -Wl,-rpath,... yes
#10 754.4 checking build system type... x86_64-pc-linux-musl
#10 754.4 checking host system type... x86_64-pc-linux-musl
#10 754.4 checking target system type... x86_64-pc-linux-musl
#10 754.4 checking for PHP prefix... /usr/local
#10 754.4 checking for PHP includes... -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib
#10 754.4 checking for PHP extension directory... /usr/local/lib/php/extensions/no-debug-non-zts-20230831
#10 754.4 checking for PHP installed headers prefix... /usr/local/include/php
#10 754.4 checking if debug is enabled... no
#10 754.4 checking if zts is enabled... no
#10 754.5 checking for gawk... no
#10 754.5 checking for nawk... no
#10 754.5 checking for awk... awk
#10 754.5 checking if awk is broken... no
#10 754.5 checking whether to enable pcntl support... yes, shared
#10 754.5 checking for fork... yes
#10 754.5 checking for waitpid... yes
#10 754.5 checking for sigaction... yes
#10 754.6 checking for getpriority... yes
#10 754.6 checking for setpriority... yes
#10 754.7 checking for wait3... yes
#10 754.7 checking for wait4... yes
#10 754.7 checking for sigwaitinfo... yes
#10 754.8 checking for sigtimedwait... yes
#10 754.8 checking for unshare... yes
#10 754.8 checking for rfork... no
#10 754.9 checking for forkx... no
#10 754.9 checking for siginfo_t... yes
#10 755.0 checking for a sed that does not truncate output... /bin/sed
#10 755.0 checking for ld used by cc... /usr/x86_64-alpine-linux-musl/bin/ld
#10 755.0 checking if the linker (/usr/x86_64-alpine-linux-musl/bin/ld) is GNU ld... yes
#10 755.0 checking for /usr/x86_64-alpine-linux-musl/bin/ld option to reload object files... -r       
#10 755.0 checking for BSD-compatible nm... /usr/bin/nm -B
#10 755.0 checking whether ln -s works... yes
#10 755.0 checking how to recognize dependent libraries... pass_all
#10 755.0 checking for stdio.h... yes
#10 755.0 checking for stdlib.h... yes
#10 755.0 checking for string.h... yes
#10 755.1 checking for inttypes.h... yes
#10 755.1 checking for stdint.h... yes
#10 755.1 checking for strings.h... yes
#10 755.1 checking for sys/stat.h... yes
#10 755.2 checking for sys/types.h... yes
#10 755.2 checking for unistd.h... yes
#10 755.3 checking for dlfcn.h... yes
#10 755.3 checking the maximum length of command line arguments... 98304
#10 755.3 checking command to parse /usr/bin/nm -B output from cc object... ok
#10 755.4 checking for objdir... .libs
#10 755.4 checking for ar... ar
#10 755.4 checking for ranlib... ranlib
#10 755.4 checking for strip... strip
#10 755.5 checking if cc supports -fno-rtti -fno-exceptions... no
#10 755.5 checking for cc option to produce PIC... -fPIC
#10 755.5 checking if cc PIC flag -fPIC works... yes
#10 755.5 checking if cc static flag -static works... yes
#10 755.6 checking if cc supports -c -o file.o... yes
#10 755.6 checking whether the cc linker (/usr/x86_64-alpine-linux-musl/bin/ld -m elf_x86_64) supports shared libraries... yes
#10 755.6 checking whether -lc should be explicitly linked in... no
#10 755.7 checking dynamic linker characteristics... GNU/Linux ld.so
#10 755.7 checking how to hardcode library paths into programs... immediate
#10 755.7 checking whether stripping libraries is possible... yes
#10 755.7 checking if libtool supports shared libraries... yes
#10 755.7 checking whether to build shared libraries... yes
#10 755.7 checking whether to build static libraries... no
#10 755.8
#10 755.8 creating libtool
#10 755.8 appending configuration tag "CXX" to libtool
#10 755.9 configure: patching config.h.in
#10 755.9 configure: creating ./config.status
#10 756.0 config.status: creating config.h
#10 756.0 /bin/sh /usr/src/php/ext/pcntl/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/pcntl -I/usr/src/php/ext/pcntl/include -I/usr/src/php/ext/pcntl/main -I/usr/src/php/ext/pcntl -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE   -DHAVE_STRUCT_SIGINFO_T -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pcntl/pcntl.c -o pcntl.lo  -MMD -MF pcntl.dep -MT pcntl.lo
#10 756.0 /bin/sh /usr/src/php/ext/pcntl/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/pcntl -I/usr/src/php/ext/pcntl/include -I/usr/src/php/ext/pcntl/main -I/usr/src/php/ext/pcntl -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE   -DHAVE_STRUCT_SIGINFO_T -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pcntl/php_signal.c -o php_signal.lo  -MMD -MF php_signal.dep -MT php_signal.lo
#10 756.1 mkdir .libs
#10 756.1 mkdir .libs
#10 756.1 mkdir: can't create directory '.libs': File exists
#10 756.1  cc -I. -I/usr/src/php/ext/pcntl -I/usr/src/php/ext/pcntl/include -I/usr/src/php/ext/pcntl/main -I/usr/src/php/ext/pcntl -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -DHAVE_STRUCT_SIGINFO_T -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pcntl/php_signal.c -MMD -MF php_signal.dep -MT php_signal.lo  -fPIC -DPIC -o .libs/php_signal.o    
#10 756.1  cc -I. -I/usr/src/php/ext/pcntl -I/usr/src/php/ext/pcntl/include -I/usr/src/php/ext/pcntl/main -I/usr/src/php/ext/pcntl -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -DHAVE_STRUCT_SIGINFO_T -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pcntl/pcntl.c -MMD -MF pcntl.dep -MT pcntl.lo  -fPIC -DPIC -o .libs/pcntl.o
#10 759.7 /bin/sh /usr/src/php/ext/pcntl/libtool --tag=CC --mode=link cc -shared -I/usr/src/php/ext/pcntl/include -I/usr/src/php/ext/pcntl/main -I/usr/src/php/ext/pcntl -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE  -Wl,-O1 -pie  -o pcntl.la -export-dynamic -avoid-version -prefer-pic -module -rpath /usr/src/php/ext/pcntl/modules  pcntl.lo php_signal.lo
#10 759.7 cc -shared  .libs/pcntl.o .libs/php_signal.o   -Wl,-O1 -Wl,-soname -Wl,pcntl.so -o .libs/pcntl.so
#10 759.7 creating pcntl.la
#10 759.7 (cd .libs && rm -f pcntl.la && ln -s ../pcntl.la pcntl.la)
#10 759.7 /bin/sh /usr/src/php/ext/pcntl/libtool --tag=CC --mode=install cp ./pcntl.la /usr/src/php/ext/pcntl/modules
#10 759.7 cp ./.libs/pcntl.so /usr/src/php/ext/pcntl/modules/pcntl.so
#10 759.8 cp ./.libs/pcntl.lai /usr/src/php/ext/pcntl/modules/pcntl.la
#10 759.8 PATH="$PATH:/sbin" ldconfig -n /usr/src/php/ext/pcntl/modules
#10 759.8 ----------------------------------------------------------------------
#10 759.8 Libraries have been installed in:
#10 759.8    /usr/src/php/ext/pcntl/modules
#10 759.8
#10 759.8 If you ever happen to want to link against installed libraries
#10 759.8 in a given directory, LIBDIR, you must either use libtool, and
#10 759.8 specify the full pathname of the library, or use the `-LLIBDIR'
#10 759.8 flag during linking and do at least one of the following:
#10 759.8    - add LIBDIR to the `LD_LIBRARY_PATH' environment variable
#10 759.8      during execution
#10 759.8    - add LIBDIR to the `LD_RUN_PATH' environment variable
#10 759.8      during linking
#10 759.8    - use the `-Wl,--rpath -Wl,LIBDIR' linker flag
#10 759.8
#10 759.8 See any operating system documentation about shared libraries for
#10 759.8 more information, such as the ld(1) and ld.so(8) manual pages.
#10 759.8 ----------------------------------------------------------------------
#10 759.8
#10 759.8 Build complete.
#10 759.8 Don't forget to run 'make test'.
#10 759.8
#10 759.8 + strip --strip-all modules/pcntl.so
#10 759.8 Installing shared extensions:     /usr/local/lib/php/extensions/no-debug-non-zts-20230831/  
#10 759.9 find . -name \*.gcno -o -name \*.gcda | xargs rm -f
#10 759.9 find . -name \*.lo -o -name \*.o -o -name \*.dep | xargs rm -f
#10 759.9 find . -name \*.la -o -name \*.a | xargs rm -f
#10 759.9 find . -name \*.so | xargs rm -f
#10 759.9 find . -name .libs -a -type d|xargs rm -rf
#10 759.9 rm -f libphp.la      modules/* libs/*
#10 759.9 rm -f ext/opcache/jit/zend_jit_x86.c
#10 759.9 rm -f ext/opcache/jit/zend_jit_arm64.c
#10 759.9 rm -f ext/opcache/minilua
#10 760.0 Configuring for:
#10 760.0 PHP Api Version:         20230831
#10 760.0 Zend Module Api No:      20230831
#10 760.0 Zend Extension Api No:   420230831
#10 760.8 checking for grep that handles long lines and -e... /bin/grep
#10 760.9 checking for egrep... /bin/grep -E
#10 760.9 checking for a sed that does not truncate output... /bin/sed
#10 760.9 checking for pkg-config... /usr/bin/pkg-config
#10 760.9 checking pkg-config is at least version 0.9.0... yes
#10 760.9 checking for cc... cc
#10 760.9 checking whether the C compiler works... yes
#10 761.0 checking for C compiler default output file name... a.out
#10 761.0 checking for suffix of executables... 
#10 761.0 checking whether we are cross compiling... no
#10 761.0 checking for suffix of object files... o
#10 761.1 checking whether the compiler supports GNU C... yes
#10 761.1 checking whether cc accepts -g... yes
#10 761.1 checking for cc option to enable C11 features... none needed
#10 761.2 checking how to run the C preprocessor... cc -E
#10 761.3 checking for egrep -e... (cached) /bin/grep -E
#10 761.3 checking for icc... no
#10 761.3 checking for suncc... no
#10 761.3 checking for system library directory... lib
#10 761.3 checking if compiler supports -Wl,-rpath,... yes
#10 761.3 checking build system type... x86_64-pc-linux-musl
#10 761.3 checking host system type... x86_64-pc-linux-musl
#10 761.3 checking target system type... x86_64-pc-linux-musl
#10 761.4 checking for PHP prefix... /usr/local
#10 761.4 checking for PHP includes... -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib
#10 761.4 checking for PHP extension directory... /usr/local/lib/php/extensions/no-debug-non-zts-20230831
#10 761.4 checking for PHP installed headers prefix... /usr/local/include/php
#10 761.4 checking if debug is enabled... no
#10 761.4 checking if zts is enabled... no
#10 761.4 checking for gawk... no
#10 761.4 checking for nawk... no
#10 761.4 checking for awk... awk
#10 761.4 checking if awk is broken... no
#10 761.4 checking for MySQL support for PDO... yes, shared
#10 761.4 checking for the location of libz... no
#10 761.4 checking for MySQL UNIX socket location...
#10 761.4 checking for PDO includes... /usr/local/include/php/ext
#10 761.4 checking for a sed that does not truncate output... /bin/sed
#10 761.4 checking for ld used by cc... /usr/x86_64-alpine-linux-musl/bin/ld
#10 761.5 checking if the linker (/usr/x86_64-alpine-linux-musl/bin/ld) is GNU ld... yes
#10 761.5 checking for /usr/x86_64-alpine-linux-musl/bin/ld option to reload object files... -r       
#10 761.5 checking for BSD-compatible nm... /usr/bin/nm -B
#10 761.5 checking whether ln -s works... yes
#10 761.5 checking how to recognize dependent libraries... pass_all
#10 761.5 checking for stdio.h... yes
#10 761.5 checking for stdlib.h... yes
#10 761.5 checking for string.h... yes
#10 761.5 checking for inttypes.h... yes
#10 761.6 checking for stdint.h... yes
#10 761.6 checking for strings.h... yes
#10 761.6 checking for sys/stat.h... yes
#10 761.6 checking for sys/types.h... yes
#10 761.7 checking for unistd.h... yes
#10 761.7 checking for dlfcn.h... yes
#10 761.7 checking the maximum length of command line arguments... 98304
#10 761.7 checking command to parse /usr/bin/nm -B output from cc object... ok
#10 761.8 checking for objdir... .libs
#10 761.8 checking for ar... ar
#10 761.8 checking for ranlib... ranlib
#10 761.8 checking for strip... strip
#10 761.8 checking if cc supports -fno-rtti -fno-exceptions... no
#10 761.9 checking for cc option to produce PIC... -fPIC
#10 761.9 checking if cc PIC flag -fPIC works... yes
#10 761.9 checking if cc static flag -static works... yes
#10 761.9 checking if cc supports -c -o file.o... yes
#10 761.9 checking whether the cc linker (/usr/x86_64-alpine-linux-musl/bin/ld -m elf_x86_64) supports shared libraries... yes
#10 762.0 checking whether -lc should be explicitly linked in... no
#10 762.0 checking dynamic linker characteristics... GNU/Linux ld.so
#10 762.0 checking how to hardcode library paths into programs... immediate
#10 762.0 checking whether stripping libraries is possible... yes
#10 762.0 checking if libtool supports shared libraries... yes
#10 762.0 checking whether to build shared libraries... yes
#10 762.0 checking whether to build static libraries... no
#10 762.1
#10 762.1 creating libtool
#10 762.1 appending configuration tag "CXX" to libtool
#10 762.2 configure: patching config.h.in
#10 762.2 configure: creating ./config.status
#10 762.3 config.status: creating config.h
#10 762.3 /bin/sh /usr/src/php/ext/pdo_mysql/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/pdo_mysql -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE   -I/usr/local/include/php/ext -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pdo_mysql/pdo_mysql.c -o pdo_mysql.lo  -MMD -MF pdo_mysql.dep -MT pdo_mysql.lo
#10 762.3 /bin/sh /usr/src/php/ext/pdo_mysql/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/pdo_mysql -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE   -I/usr/local/include/php/ext -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pdo_mysql/mysql_driver.c -o mysql_driver.lo  -MMD -MF mysql_driver.dep -MT mysql_driver.lo
#10 762.3 /bin/sh /usr/src/php/ext/pdo_mysql/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/pdo_mysql -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE   -I/usr/local/include/php/ext -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pdo_mysql/mysql_statement.c -o mysql_statement.lo  -MMD -MF mysql_statement.dep -MT mysql_statement.lo        
#10 762.4 mkdir .libs
#10 762.4 mkdir .libs
#10 762.4 mkdir: can't create directory '.libs': File exists
#10 762.4  cc -I. -I/usr/src/php/ext/pdo_mysql -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -I/usr/local/include/php/ext -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pdo_mysql/mysql_driver.c -MMD -MF mysql_driver.dep -MT mysql_driver.lo  -fPIC -DPIC -o .libs/mysql_driver.o
#10 762.4  cc -I. -I/usr/src/php/ext/pdo_mysql -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -I/usr/local/include/php/ext -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pdo_mysql/mysql_statement.c -MMD -MF mysql_statement.dep -MT mysql_statement.lo  -fPIC -DPIC -o .libs/mysql_statement.o
#10 762.4  cc -I. -I/usr/src/php/ext/pdo_mysql -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -I/usr/local/include/php/ext -DZEND_ENABLE_STATIC_TSRMLS_CACHE=1 -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/pdo_mysql/pdo_mysql.c -MMD -MF pdo_mysql.dep -MT pdo_mysql.lo  -fPIC -DPIC -o .libs/pdo_mysql.o
#10 763.1 /bin/sh /usr/src/php/ext/pdo_mysql/libtool --tag=CC --mode=link cc -shared -I/usr/src/php/ext/pdo_mysql/include -I/usr/src/php/ext/pdo_mysql/main -I/usr/src/php/ext/pdo_mysql -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE  -Wl,-O1 -pie  -o pdo_mysql.la -export-dynamic -avoid-version -prefer-pic -module -rpath /usr/src/php/ext/pdo_mysql/modules  pdo_mysql.lo mysql_driver.lo mysql_statement.lo
#10 763.2 cc -shared  .libs/pdo_mysql.o .libs/mysql_driver.o .libs/mysql_statement.o   -Wl,-O1 -Wl,-soname -Wl,pdo_mysql.so -o .libs/pdo_mysql.so
#10 763.2 creating pdo_mysql.la
#10 763.2 (cd .libs && rm -f pdo_mysql.la && ln -s ../pdo_mysql.la pdo_mysql.la)
#10 763.2 /bin/sh /usr/src/php/ext/pdo_mysql/libtool --tag=CC --mode=install cp ./pdo_mysql.la /usr/src/php/ext/pdo_mysql/modules
#10 763.2 cp ./.libs/pdo_mysql.so /usr/src/php/ext/pdo_mysql/modules/pdo_mysql.so
#10 763.2 cp ./.libs/pdo_mysql.lai /usr/src/php/ext/pdo_mysql/modules/pdo_mysql.la
#10 763.3 PATH="$PATH:/sbin" ldconfig -n /usr/src/php/ext/pdo_mysql/modules
#10 763.3 ----------------------------------------------------------------------
#10 763.3 Libraries have been installed in:
#10 763.3    /usr/src/php/ext/pdo_mysql/modules
#10 763.3
#10 763.3 If you ever happen to want to link against installed libraries
#10 763.3 in a given directory, LIBDIR, you must either use libtool, and
#10 763.3 specify the full pathname of the library, or use the `-LLIBDIR'
#10 763.3 flag during linking and do at least one of the following:
#10 763.3    - add LIBDIR to the `LD_LIBRARY_PATH' environment variable
#10 763.3      during execution
#10 763.3    - add LIBDIR to the `LD_RUN_PATH' environment variable
#10 763.3      during linking
#10 763.3    - use the `-Wl,--rpath -Wl,LIBDIR' linker flag
#10 763.3
#10 763.3 See any operating system documentation about shared libraries for
#10 763.3 more information, such as the ld(1) and ld.so(8) manual pages.
#10 763.3 ----------------------------------------------------------------------
#10 763.3
#10 763.3 Build complete.
#10 763.3 Don't forget to run 'make test'.
#10 763.3
#10 763.3 + strip --strip-all modules/pdo_mysql.so
#10 763.3 Installing shared extensions:     /usr/local/lib/php/extensions/no-debug-non-zts-20230831/  
#10 763.4 find . -name \*.gcno -o -name \*.gcda | xargs rm -f
#10 763.4 find . -name \*.lo -o -name \*.o -o -name \*.dep | xargs rm -f
#10 763.4 find . -name \*.la -o -name \*.a | xargs rm -f
#10 763.4 find . -name \*.so | xargs rm -f
#10 763.4 find . -name .libs -a -type d|xargs rm -rf
#10 763.4 rm -f libphp.la      modules/* libs/*
#10 763.4 rm -f ext/opcache/jit/zend_jit_x86.c
#10 763.4 rm -f ext/opcache/jit/zend_jit_arm64.c
#10 763.4 rm -f ext/opcache/minilua
#10 763.5 Configuring for:
#10 763.5 PHP Api Version:         20230831
#10 763.5 Zend Module Api No:      20230831
#10 763.5 Zend Extension Api No:   420230831
#10 764.3 checking for grep that handles long lines and -e... /bin/grep
#10 764.4 checking for egrep... /bin/grep -E
#10 764.4 checking for a sed that does not truncate output... /bin/sed
#10 764.4 checking for pkg-config... /usr/bin/pkg-config
#10 764.4 checking pkg-config is at least version 0.9.0... yes
#10 764.4 checking for cc... cc
#10 764.4 checking whether the C compiler works... yes
#10 764.4 checking for C compiler default output file name... a.out
#10 764.4 checking for suffix of executables... 
#10 764.5 checking whether we are cross compiling... no
#10 764.5 checking for suffix of object files... o
#10 764.5 checking whether the compiler supports GNU C... yes
#10 764.5 checking whether cc accepts -g... yes
#10 764.6 checking for cc option to enable C11 features... none needed
#10 764.7 checking how to run the C preprocessor... cc -E
#10 764.7 checking for egrep -e... (cached) /bin/grep -E
#10 764.7 checking for icc... no
#10 764.8 checking for suncc... no
#10 764.8 checking for system library directory... lib
#10 764.8 checking if compiler supports -Wl,-rpath,... yes
#10 764.8 checking build system type... x86_64-pc-linux-musl
#10 764.8 checking host system type... x86_64-pc-linux-musl
#10 764.8 checking target system type... x86_64-pc-linux-musl
#10 764.9 checking for PHP prefix... /usr/local
#10 764.9 checking for PHP includes... -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib
#10 764.9 checking for PHP extension directory... /usr/local/lib/php/extensions/no-debug-non-zts-20230831
#10 764.9 checking for PHP installed headers prefix... /usr/local/include/php
#10 764.9 checking if debug is enabled... no
#10 764.9 checking if zts is enabled... no
#10 764.9 checking for gawk... no
#10 764.9 checking for nawk... no
#10 764.9 checking for awk... awk
#10 764.9 checking if awk is broken... no
#10 764.9 checking for zip archive read/write support... yes, shared
#10 764.9 checking for libzip >= 0.11 libzip != 1.3.1 libzip != 1.7.0... yes
#10 764.9 checking for zip_file_set_mtime in -lzip... yes
#10 765.0 checking for zip_file_set_encryption in -lzip... yes
#10 765.0 checking for zip_libzip_version in -lzip... yes
#10 765.1 checking for zip_register_progress_callback_with_state in -lzip... yes
#10 765.2 checking for zip_register_cancel_callback_with_state in -lzip... yes
#10 765.2 checking for zip_compression_method_supported in -lzip... yes
#10 765.3 checking for a sed that does not truncate output... /bin/sed
#10 765.3 checking for ld used by cc... /usr/x86_64-alpine-linux-musl/bin/ld
#10 765.3 checking if the linker (/usr/x86_64-alpine-linux-musl/bin/ld) is GNU ld... yes
#10 765.3 checking for /usr/x86_64-alpine-linux-musl/bin/ld option to reload object files... -r       
#10 765.3 checking for BSD-compatible nm... /usr/bin/nm -B
#10 765.3 checking whether ln -s works... yes
#10 765.3 checking how to recognize dependent libraries... pass_all
#10 765.3 checking for stdio.h... yes
#10 765.3 checking for stdlib.h... yes
#10 765.4 checking for string.h... yes
#10 765.4 checking for inttypes.h... yes
#10 765.4 checking for stdint.h... yes
#10 765.4 checking for strings.h... yes
#10 765.4 checking for sys/stat.h... yes
#10 765.5 checking for sys/types.h... yes
#10 765.5 checking for unistd.h... yes
#10 765.5 checking for dlfcn.h... yes
#10 765.5 checking the maximum length of command line arguments... 98304
#10 765.5 checking command to parse /usr/bin/nm -B output from cc object... ok
#10 765.6 checking for objdir... .libs
#10 765.6 checking for ar... ar
#10 765.6 checking for ranlib... ranlib
#10 765.6 checking for strip... strip
#10 765.7 checking if cc supports -fno-rtti -fno-exceptions... no
#10 765.7 checking for cc option to produce PIC... -fPIC
#10 765.7 checking if cc PIC flag -fPIC works... yes
#10 765.7 checking if cc static flag -static works... yes
#10 765.8 checking if cc supports -c -o file.o... yes
#10 765.8 checking whether the cc linker (/usr/x86_64-alpine-linux-musl/bin/ld -m elf_x86_64) supports shared libraries... yes
#10 765.8 checking whether -lc should be explicitly linked in... no
#10 765.9 checking dynamic linker characteristics... GNU/Linux ld.so
#10 765.9 checking how to hardcode library paths into programs... immediate
#10 765.9 checking whether stripping libraries is possible... yes
#10 765.9 checking if libtool supports shared libraries... yes
#10 765.9 checking whether to build shared libraries... yes
#10 765.9 checking whether to build static libraries... no
#10 766.0
#10 766.0 creating libtool
#10 766.0 appending configuration tag "CXX" to libtool
#10 766.1 configure: patching config.h.in
#10 766.1 configure: creating ./config.status
#10 766.2 config.status: creating config.h
#10 766.2 /bin/sh /usr/src/php/ext/zip/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/zip -I/usr/src/php/ext/zip/include -I/usr/src/php/ext/zip/main -I/usr/src/php/ext/zip -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/zip/php_zip.c -o php_zip.lo  -MMD -MF php_zip.dep -MT php_zip.lo
#10 766.2 /bin/sh /usr/src/php/ext/zip/libtool --tag=CC --mode=compile cc -I. -I/usr/src/php/ext/zip -I/usr/src/php/ext/zip/include -I/usr/src/php/ext/zip/main -I/usr/src/php/ext/zip -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/zip/zip_stream.c -o zip_stream.lo  -MMD -MF zip_stream.dep -MT zip_stream.lo
#10 766.3 mkdir .libs
#10 766.3 mkdir .libs
#10 766.3 mkdir: can't create directory '.libs': File exists
#10 766.3  cc -I. -I/usr/src/php/ext/zip -I/usr/src/php/ext/zip/include -I/usr/src/php/ext/zip/main -I/usr/src/php/ext/zip -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/zip/php_zip.c -MMD -MF php_zip.dep -MT php_zip.lo  -fPIC -DPIC -o .libs/php_zip.o
#10 766.3  cc -I. -I/usr/src/php/ext/zip -I/usr/src/php/ext/zip/include -I/usr/src/php/ext/zip/main -I/usr/src/php/ext/zip -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /usr/src/php/ext/zip/zip_stream.c -MMD -MF zip_stream.dep -MT zip_stream.lo  -fPIC -DPIC -o .libs/zip_stream.o
#10 768.5 /bin/sh /usr/src/php/ext/zip/libtool --tag=CC --mode=link cc -shared -I/usr/src/php/ext/zip/include -I/usr/src/php/ext/zip/main -I/usr/src/php/ext/zip -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H  -fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE  -Wl,-O1 -pie  -o zip.la -export-dynamic -avoid-version -prefer-pic -module -rpath /usr/src/php/ext/zip/modules  php_zip.lo zip_stream.lo -lzip
#10 768.5 cc -shared  .libs/php_zip.o .libs/zip_stream.o  -lzip  -Wl,-O1 -Wl,-soname -Wl,zip.so -o .libs/zip.so
#10 768.6 creating zip.la
#10 768.6 (cd .libs && rm -f zip.la && ln -s ../zip.la zip.la)
#10 768.6 /bin/sh /usr/src/php/ext/zip/libtool --tag=CC --mode=install cp ./zip.la /usr/src/php/ext/zip/modules
#10 768.6 cp ./.libs/zip.so /usr/src/php/ext/zip/modules/zip.so
#10 768.6 cp ./.libs/zip.lai /usr/src/php/ext/zip/modules/zip.la
#10 768.6 PATH="$PATH:/sbin" ldconfig -n /usr/src/php/ext/zip/modules
#10 768.6 ----------------------------------------------------------------------
#10 768.6 Libraries have been installed in:
#10 768.6    /usr/src/php/ext/zip/modules
#10 768.6
#10 768.6 If you ever happen to want to link against installed libraries
#10 768.6 in a given directory, LIBDIR, you must either use libtool, and
#10 768.6 specify the full pathname of the library, or use the `-LLIBDIR'
#10 768.6 flag during linking and do at least one of the following:
#10 768.6    - add LIBDIR to the `LD_LIBRARY_PATH' environment variable
#10 768.6      during execution
#10 768.6    - add LIBDIR to the `LD_RUN_PATH' environment variable
#10 768.6      during linking
#10 768.6    - use the `-Wl,--rpath -Wl,LIBDIR' linker flag
#10 768.6
#10 768.6 See any operating system documentation about shared libraries for
#10 768.6 more information, such as the ld(1) and ld.so(8) manual pages.
#10 768.6 ----------------------------------------------------------------------
#10 768.6
#10 768.6 Build complete.
#10 768.6 Don't forget to run 'make test'.
#10 768.6
#10 768.6 + strip --strip-all modules/zip.so
#10 768.6 Installing shared extensions:     /usr/local/lib/php/extensions/no-debug-non-zts-20230831/  
#10 768.7 find . -name \*.gcno -o -name \*.gcda | xargs rm -f
#10 768.7 find . -name \*.lo -o -name \*.o -o -name \*.dep | xargs rm -f
#10 768.7 find . -name \*.la -o -name \*.a | xargs rm -f
#10 768.8 find . -name \*.so | xargs rm -f
#10 768.8 find . -name .libs -a -type d|xargs rm -rf
#10 768.8 rm -f libphp.la      modules/* libs/*
#10 768.8 rm -f ext/opcache/jit/zend_jit_x86.c
#10 768.8 rm -f ext/opcache/jit/zend_jit_arm64.c
#10 768.8 rm -f ext/opcache/minilua
#10 768.8 WARNING: opening from cache https://dl-cdn.alpinelinux.org/alpine/v3.23/main/x86_64/APKINDEX.tar.gz: No such file or directory
#10 768.8 WARNING: opening from cache https://dl-cdn.alpinelinux.org/alpine/v3.23/community/x86_64/APKINDEX.tar.gz: No such file or directory
#10 768.8 (1/1) Purging .phpize-deps-configure (20260509.091146)
#10 768.8 OK: 458.2 MiB in 108 packages
#10 769.6 Updating channel "pecl.php.net"
#10 770.6 Channel "pecl.php.net" is up to date
#10 773.0 downloading redis-6.2.0.tgz ...
#10 773.0 Starting to download redis-6.2.0.tgz (379,865 bytes)
#10 773.0 .............................................................................done: 379,865 bytes
#10 778.5 43 source files, building
#10 778.5 running: phpize
#10 778.5 Configuring for:
#10 778.5 PHP Api Version:         20230831
#10 778.5 Zend Module Api No:      20230831
#10 778.5 Zend Extension Api No:   420230831
#10 779.2 enable igbinary serializer support? [no] : enable lzf compression support? [no] : enable zstd compression support? [no] : enable msgpack serializer support? [no] : enable lz4 compression? [no] : use system liblz4? [yes] : building in /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0
#10 779.2 running: /tmp/pear/temp/redis/configure --with-php-config=/usr/local/bin/php-config --enable-redis-igbinary=no --enable-redis-lzf=no --enable-redis-zstd=no --enable-redis-msgpack=no --enable-redis-lz4=no --with-liblz4
#10 779.3 checking for grep that handles long lines and -e... /bin/grep
#10 779.3 checking for egrep... /bin/grep -E
#10 779.3 checking for a sed that does not truncate output... /bin/sed
#10 779.3 checking for pkg-config... /usr/bin/pkg-config
#10 779.3 checking pkg-config is at least version 0.9.0... yes
#10 779.3 checking for cc... cc
#10 779.4 checking whether the C compiler works... yes
#10 779.4 checking for C compiler default output file name... a.out
#10 779.4 checking for suffix of executables...
#10 779.5 checking whether we are cross compiling... no
#10 779.5 checking for suffix of object files... o
#10 779.5 checking whether the compiler supports GNU C... yes
#10 779.5 checking whether cc accepts -g... yes
#10 779.6 checking for cc option to enable C11 features... none needed
#10 779.6 checking how to run the C preprocessor... cc -E
#10 779.7 checking for egrep -e... (cached) /bin/grep -E
#10 779.7 checking for icc... no
#10 779.7 checking for suncc... no
#10 779.7 checking for system library directory... lib
#10 779.7 checking if compiler supports -Wl,-rpath,... yes
#10 779.8 checking build system type... x86_64-pc-linux-musl
#10 779.8 checking host system type... x86_64-pc-linux-musl
#10 779.8 checking target system type... x86_64-pc-linux-musl
#10 779.8 checking for PHP prefix... /usr/local
#10 779.8 checking for PHP includes... -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib
#10 779.8 checking for PHP extension directory... /usr/local/lib/php/extensions/no-debug-non-zts-20230831
#10 779.8 checking for PHP installed headers prefix... /usr/local/include/php
#10 779.8 checking if debug is enabled... no
#10 779.8 checking if zts is enabled... no
#10 779.8 checking for gawk... no
#10 779.8 checking for nawk... no
#10 779.8 checking for awk... awk
#10 779.8 checking if awk is broken... no
#10 779.8 checking whether to enable redis support... yes, shared
#10 779.8 checking whether to enable sessions... yes
#10 779.8 checking whether to enable json serializer support... yes
#10 779.8 checking whether to enable igbinary serializer support... no
#10 779.8 checking whether to enable msgpack serializer support... no
#10 779.8 checking whether to enable lzf compression... no
#10 779.8 checking use system liblzf... no
#10 779.8 checking whether to enable Zstd compression... no
#10 779.8 checking use system libzstd... yes
#10 779.8 checking whether to enable lz4 compression... no
#10 779.8 checking use system liblz4... yes
#10 779.8 checking for hash includes... /usr/local/include/php
#10 779.8 checking for json includes... /usr/local/include/php
#10 779.8 checking for redis json support... enabled
#10 779.8 checking for redis igbinary support... disabled
#10 779.8 checking for pkg-config... /usr/bin/pkg-config
#10 779.9 checking for git... no
#10 779.9 checking for a sed that does not truncate output... /bin/sed
#10 779.9 checking for ld used by cc... /usr/x86_64-alpine-linux-musl/bin/ld
#10 779.9 checking if the linker (/usr/x86_64-alpine-linux-musl/bin/ld) is GNU ld... yes
#10 779.9 checking for /usr/x86_64-alpine-linux-musl/bin/ld option to reload object files... -r       
#10 779.9 checking for BSD-compatible nm... /usr/bin/nm -B
#10 779.9 checking whether ln -s works... yes
#10 779.9 checking how to recognize dependent libraries... pass_all
#10 779.9 checking for stdio.h... yes
#10 779.9 checking for stdlib.h... yes
#10 780.0 checking for string.h... yes
#10 780.0 checking for inttypes.h... yes
#10 780.0 checking for stdint.h... yes
#10 780.0 checking for strings.h... yes
#10 780.1 checking for sys/stat.h... yes
#10 780.1 checking for sys/types.h... yes
#10 780.1 checking for unistd.h... yes
#10 780.2 checking for dlfcn.h... yes
#10 780.2 checking the maximum length of command line arguments... 98304
#10 780.3 checking command to parse /usr/bin/nm -B output from cc object... ok
#10 780.3 checking for objdir... .libs
#10 780.3 checking for ar... ar
#10 780.3 checking for ranlib... ranlib
#10 780.3 checking for strip... strip
#10 780.4 checking if cc supports -fno-rtti -fno-exceptions... no
#10 780.4 checking for cc option to produce PIC... -fPIC
#10 780.4 checking if cc PIC flag -fPIC works... yes
#10 780.5 checking if cc static flag -static works... yes
#10 780.5 checking if cc supports -c -o file.o... yes
#10 780.5 checking whether the cc linker (/usr/x86_64-alpine-linux-musl/bin/ld -m elf_x86_64) supports shared libraries... yes
#10 780.6 checking whether -lc should be explicitly linked in... no
#10 780.6 checking dynamic linker characteristics... GNU/Linux ld.so
#10 780.6 checking how to hardcode library paths into programs... immediate
#10 780.6 checking whether stripping libraries is possible... yes
#10 780.6 checking if libtool supports shared libraries... yes
#10 780.6 checking whether to build shared libraries... yes
#10 780.6 checking whether to build static libraries... no
#10 780.7
#10 780.7 creating libtool
#10 780.8 appending configuration tag "CXX" to libtool
#10 780.9 configure: patching config.h.in
#10 780.9 configure: creating ./config.status
#10 781.0 config.status: creating config.h
#10 781.0 running: make
#10 781.0 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis.c -o redis.lo  -MMD -MF redis.dep -MT redis.lo
#10 781.1 mkdir .libs
#10 781.1  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis.c -MMD -MF redis.dep -MT redis.lo  -fPIC -DPIC -o .libs/redis.o
#10 787.5 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_commands.c -o redis_commands.lo  -MMD -MF redis_commands.dep -MT redis_commands.lo
#10 787.6  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_commands.c -MMD -MF redis_commands.dep -MT redis_commands.lo  -fPIC -DPIC -o .libs/redis_commands.o
#10 794.8 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/library.c -o library.lo  -MMD -MF library.dep -MT library.lo
#10 794.8  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/library.c -MMD -MF library.dep -MT library.lo  -fPIC -DPIC -o .libs/library.o
#10 797.4 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_session.c -o redis_session.lo  -MMD -MF redis_session.dep -MT redis_session.lo
#10 797.5  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_session.c -MMD -MF redis_session.dep -MT redis_session.lo  -fPIC -DPIC -o .libs/redis_session.o
#10 798.3 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_array.c -o redis_array.lo  -MMD -MF redis_array.dep -MT redis_array.lo
#10 798.3  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_array.c -MMD -MF redis_array.dep -MT redis_array.lo  -fPIC -DPIC -o .libs/redis_array.o
#10 799.6 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_array_impl.c -o redis_array_impl.lo  -MMD -MF redis_array_impl.dep -MT redis_array_impl.lo
#10 799.6  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_array_impl.c -MMD -MF redis_array_impl.dep -MT redis_array_impl.lo  -fPIC -DPIC -o .libs/redis_array_impl.o
#10 802.0 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_cluster.c -o redis_cluster.lo  -MMD -MF redis_cluster.dep -MT redis_cluster.lo
#10 802.1  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_cluster.c -MMD -MF redis_cluster.dep -MT redis_cluster.lo  -fPIC -DPIC -o .libs/redis_cluster.o
#10 808.0 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/cluster_library.c -o cluster_library.lo  -MMD -MF cluster_library.dep -MT cluster_library.lo
#10 808.0  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/cluster_library.c -MMD -MF cluster_library.dep -MT cluster_library.lo  -fPIC -DPIC -o .libs/cluster_library.o
#10 810.6 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_sentinel.c -o redis_sentinel.lo  -MMD -MF redis_sentinel.dep -MT redis_sentinel.lo
#10 810.6  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/redis_sentinel.c -MMD -MF redis_sentinel.dep -MT redis_sentinel.lo  -fPIC -DPIC -o .libs/redis_sentinel.o
#10 811.3 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/sentinel_library.c -o sentinel_library.lo  -MMD -MF sentinel_library.dep -MT sentinel_library.lo
#10 811.4  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/sentinel_library.c -MMD -MF sentinel_library.dep -MT sentinel_library.lo  -fPIC -DPIC -o .libs/sentinel_library.o
#10 811.6 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=compile cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/backoff.c -o backoff.lo  -MMD -MF backoff.dep -MT backoff.lo
#10 811.7  cc -I. -I/tmp/pear/temp/redis -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext -DHAVE_CONFIG_H -g -O2 -D_GNU_SOURCE -DZEND_COMPILE_DL_EXT=1 -c /tmp/pear/temp/redis/backoff.c -MMD -MF backoff.dep -MT backoff.lo  -fPIC -DPIC -o .libs/backoff.o
#10 812.0 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=link cc -shared -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/include -I/tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/main -I/tmp/pear/temp/redis -I/usr/local/include/php -I/usr/local/include/php/main -I/usr/local/include/php/TSRM -I/usr/local/include/php/Zend -I/usr/local/include/php/ext -I/usr/local/include/php/ext/date/lib -I/usr/local/include/php/ext  -DHAVE_CONFIG_H  -g -O2 -D_GNU_SOURCE    -o redis.la -export-dynamic -avoid-version -prefer-pic -module -rpath /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/modules  redis.lo redis_commands.lo library.lo redis_session.lo redis_array.lo redis_array_impl.lo redis_cluster.lo cluster_library.lo redis_sentinel.lo sentinel_library.lo backoff.lo
#10 812.1 cc -shared  .libs/redis.o .libs/redis_commands.o .libs/library.o .libs/redis_session.o .libs/redis_array.o .libs/redis_array_impl.o .libs/redis_cluster.o .libs/cluster_library.o .libs/redis_sentinel.o .libs/sentinel_library.o .libs/backoff.o   -Wl,-soname -Wl,redis.so -o .libs/redis.so
#10 812.1 creating redis.la
#10 812.1 (cd .libs && rm -f redis.la && ln -s ../redis.la redis.la)
#10 812.1 /bin/sh /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/libtool --tag=CC --mode=install cp ./redis.la /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/modules
#10 812.2 cp ./.libs/redis.so /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/modules/redis.so
#10 812.2 cp ./.libs/redis.lai /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/modules/redis.la
#10 812.2 PATH="$PATH:/sbin" ldconfig -n /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/modules
#10 812.2 ----------------------------------------------------------------------
#10 812.2 Libraries have been installed in:
#10 812.2    /tmp/pear/temp/pear-build-defaultuserGGopiN/redis-6.2.0/modules
#10 812.2
#10 812.2 If you ever happen to want to link against installed libraries
#10 812.2 in a given directory, LIBDIR, you must either use libtool, and
#10 812.2 specify the full pathname of the library, or use the `-LLIBDIR'
#10 812.2 flag during linking and do at least one of the following:
#10 812.2    - add LIBDIR to the `LD_LIBRARY_PATH' environment variable
#10 812.2      during execution
#10 812.2    - add LIBDIR to the `LD_RUN_PATH' environment variable
#10 812.2      during linking
#10 812.2    - use the `-Wl,--rpath -Wl,LIBDIR' linker flag
#10 812.2
#10 812.2 See any operating system documentation about shared libraries for
#10 812.2 more information, such as the ld(1) and ld.so(8) manual pages.
#10 812.2 ----------------------------------------------------------------------
#10 812.2
#10 812.2 Build complete.
#10 812.2 Don't forget to run 'make test'.
#10 812.2
#10 812.2 running: make INSTALL_ROOT="/tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0" install
#10 812.2 Installing shared extensions:     /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local/lib/php/extensions/no-debug-non-zts-20230831/
#10 812.3 running: find "/tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0" | xargs ls -dils
#10 812.3  141186      4 drwxr-xr-x    3 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0
#10 812.3  141237      4 drwxr-xr-x    3 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr
#10 812.3  141238      4 drwxr-xr-x    3 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local
#10 812.3  141239      4 drwxr-xr-x    3 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local/lib
#10 812.3  141240      4 drwxr-xr-x    3 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local/lib/php
#10 812.3  141241      4 drwxr-xr-x    3 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local/lib/php/extensions
#10 812.3  141242      4 drwxr-xr-x    2 root     root          4096 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local/lib/php/extensions/no-debug-non-zts-20230831    
#10 812.3  141236   3300 -rwxr-xr-x    1 root     root       3378608 May  9 09:14 /tmp/pear/temp/pear-build-defaultuserGGopiN/install-redis-6.2.0/usr/local/lib/php/extensions/no-debug-non-zts-20230831/redis.so
#10 812.3
#10 812.3 Build process completed successfully
#10 812.3 Installing '/usr/local/lib/php/extensions/no-debug-non-zts-20230831/redis.so'
#10 812.3 install ok: channel://pecl.php.net/redis-6.2.0
#10 812.3 configuration option "php_ini" is not set to php.ini location
#10 812.3 You should add "extension=redis.so" to php.ini
#10 849.6 (1/1) Installing .docker-php-ext-enable-deps (20260509.091445)
#10 849.6 OK: 458.2 MiB in 109 packages
#10 849.7 WARNING: opening from cache https://dl-cdn.alpinelinux.org/alpine/v3.23/main/x86_64/APKINDEX.tar.gz: No such file or directory
#10 849.7 WARNING: opening from cache https://dl-cdn.alpinelinux.org/alpine/v3.23/community/x86_64/APKINDEX.tar.gz: No such file or directory
#10 849.7 (1/1) Purging .docker-php-ext-enable-deps (20260509.091445)
#10 849.7 OK: 458.2 MiB in 108 packages
#10 849.7 WARNING: opening from cache https://dl-cdn.alpinelinux.org/alpine/v3.23/main/x86_64/APKINDEX.tar.gz: No such file or directory
#10 849.7 WARNING: opening from cache https://dl-cdn.alpinelinux.org/alpine/v3.23/community/x86_64/APKINDEX.tar.gz: No such file or directory
#10 849.7 World updated, but the following packages are not removed due to:
#10 849.7   pkgconf: libpng-dev freetype-dev icu-dev
#10 849.7            libzip-dev jpeg-dev oniguruma-dev
#10 849.7            libwebp-dev
#10 849.7
#10 849.7 ( 1/23) Purging autoconf (2.72-r1)
#10 849.7 ( 2/23) Purging m4 (1.4.20-r0)
#10 849.7 ( 3/23) Purging dpkg (1.22.21-r0)
#10 849.7 ( 4/23) Purging dpkg-dev (1.22.21-r0)
#10 849.7 ( 5/23) Purging file (5.46-r2)
#10 849.7 ( 6/23) Purging g++ (15.2.0-r2)
#10 849.7 ( 7/23) Purging libstdc++-dev (15.2.0-r2)
#10 849.7 ( 8/23) Purging gcc (15.2.0-r2)
#10 849.8 ( 9/23) Purging binutils (2.45.1-r0)
#10 849.8 (10/23) Purging libatomic (15.2.0-r2)
#10 849.8 (11/23) Purging libgomp (15.2.0-r2)
#10 849.8 (12/23) Purging musl-dev (1.2.5-r23)
#10 849.8 (13/23) Purging isl26 (0.26-r1)
#10 849.8 (14/23) Purging jansson (2.14.1-r0)
#10 849.8 (15/23) Purging libmagic (5.46-r2)
#10 849.8 (16/23) Purging libmd (1.1.0-r0)
#10 849.8 (17/23) Purging make (4.4.1-r3)
#10 849.8 (18/23) Purging mariadb-client-perl (11.4.10-r0)
#10 849.8 (19/23) Purging perl (5.42.2-r0)
#10 849.9 (20/23) Purging mpc1 (1.3.1-r1)
#10 849.9 (21/23) Purging mpfr4 (4.2.2-r0)
#10 849.9 (22/23) Purging re2c (4.3.1-r0)
#10 849.9 (23/23) Purging gmp (6.3.0-r4)
#10 849.9 Executing busybox-1.37.0-r30.trigger
#10 849.9 OK: 143.8 MiB in 85 packages
#10 DONE 849.9s

#14 [app-base  4/11] COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
#14 DONE 0.1s

#15 [app-base  5/11] COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-app.ini
#15 DONE 0.0s

#16 [app-base  6/11] COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/10-opcache.ini
#16 DONE 0.0s

#17 [app-base  7/11] COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-app.conf
#17 DONE 0.0s

#18 [app-base  8/11] COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint
#18 DONE 0.0s

#19 [app-base  9/11] COPY --chown=www-data:www-data . .
#19 DONE 7.3s

#20 [app-base 10/11] COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
#20 DONE 3.2s

#21 [app-base 11/11] RUN chmod +x /usr/local/bin/docker-entrypoint     && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache     && chown -R www-data:www-data storage bootstrap/cache public
#21 DONE 0.5s

#22 [frontend 1/1] RUN composer dump-autoload --no-interaction --optimize     && php artisan package:discover --ansi     && npm ci     && npm run build
#22 0.501 Generating optimized autoload files
#22 1.627 > Illuminate\Foundation\ComposerScripts::postAutoloadDump
#22 1.627 Script Illuminate\Foundation\ComposerScripts::postAutoloadDump handling the post-autoload-dump event terminated with an exception
#22 1.628 
#22 1.633 In platform_check.php line 22:
#22 1.633
#22 1.633   Composer detected issues in your platform: Your Composer dependencies requi
#22 1.633   re a PHP version ">= 8.4.0". You are running 8.3.31.
#22 1.633
#22 1.633
#22 1.633 dump-autoload [-o|--optimize] [-a|--classmap-authoritative] [--apcu] [--apcu-prefix APCU-PREFIX] [--dry-run] [--dev] [--no-dev] [--ignore-platform-req IGNORE-PLATFORM-REQ] [--ignore-platform-reqs] [--strict-psr] [--strict-ambiguous]
#22 1.633
#22 ERROR: process "/bin/sh -c composer dump-autoload --no-interaction --optimize     && php artisan package:discover --ansi     && npm ci     && npm run build" did not complete successfully: exit code: 1
------
 > [frontend 1/1] RUN composer dump-autoload --no-interaction --optimize     && php artisan package:discover --ansi     && npm ci     && npm run build:
1.627 Script Illuminate\Foundation\ComposerScripts::postAutoloadDump handling the post-autoload-dump event terminated with an exception
1.628
1.633 In platform_check.php line 22:
1.633
1.633   Composer detected issues in your platform: Your Composer dependencies requi
1.633   re a PHP version ">= 8.4.0". You are running 8.3.31.
1.633
1.633
1.633 dump-autoload [-o|--optimize] [-a|--classmap-authoritative] [--apcu] [--apcu-prefix APCU-PREFIX] [--dry-run] [--dev] [--no-dev] [--ignore-platform-req IGNORE-PLATFORM-REQ] [--ignore-platform-reqs] [--strict-psr] [--strict-ambiguous]
1.633
------
Dockerfile:69

--------------------

  68 |

  69 | >>> RUN composer dump-autoload --no-interaction --optimize \

  70 | >>>     && php artisan package:discover --ansi \

  71 | >>>     && npm ci \

  72 | >>>     && npm run build

  73 |

--------------------

failed to solve: process "/bin/sh -c composer dump-autoload --no-interaction --optimize     && php artisan package:discover --ansi     && npm ci     && npm run build" did not complete successfully: exit code: 1



View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/kkhbiwc1fy9pregqj6o9rf4dm
