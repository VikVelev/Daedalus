nvcc = /opt/cuda/bin/nvcc
cudalib =  /opt/cuda/lib64
tensorflow = /home/viktorv/.conda/envs/3dmnn_cu9/lib/python3.6/site-packages/tensorflow/include
TF_LIB=/home/viktorv/.conda/envs/3dmnn_cu9/lib/python3.6/site-packages/tensorflow

all: tf_approxmatch_so.so tf_approxmatch_g.cu.o tf_nndistance_so.so tf_nndistance_g.cu.o


tf_approxmatch_so.so: tf_approxmatch_g.cu.o tf_approxmatch.cpp
	echo $TF_LIB
	g++ -std=c++11 tf_approxmatch.cpp tf_approxmatch_g.cu.o -o tf_approxmatch_so.so -shared -fPIC -L $(TF_LIB) -ltensorflow_framework -I $(tensorflow) -lcudart -L $(cudalib) -O2 -D_GLIBCXX_USE_CXX11_ABI=0 -D GOOGLE_CUDA=1


tf_approxmatch_g.cu.o: tf_approxmatch_g.cu
	$(nvcc) -D_GLIBCXX_USE_CXX11_ABI=0 -std=c++11 -c -o tf_approxmatch_g.cu.o tf_approxmatch_g.cu -I $(tensorflow) -DGOOGLE_CUDA=1 -x cu -Xcompiler -fPIC -O2 --expt-relaxed-constexpr


tf_nndistance_so.so: tf_nndistance_g.cu.o tf_nndistance.cpp
	g++ -std=c++11 tf_nndistance.cpp tf_nndistance_g.cu.o -o tf_nndistance_so.so -shared -fPIC -L $(TF_LIB) -ltensorflow_framework -I $(tensorflow) -lcudart -L $(cudalib) -O2 -D_GLIBCXX_USE_CXX11_ABI=0 -D GOOGLE_CUDA=1


tf_nndistance_g.cu.o: tf_nndistance_g.cu
	$(nvcc) -D_GLIBCXX_USE_CXX11_ABI=0 -std=c++11 -c -o tf_nndistance_g.cu.o tf_nndistance_g.cu -I $(tensorflow) -DGOOGLE_CUDA=1 -x cu -Xcompiler -fPIC -O2 --expt-relaxed-constexpr


clean:
	rm  *.cu.o
	rm tf_approxmatch_so.so
	rm tf_nndistance_so.so