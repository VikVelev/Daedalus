import tensorflow as tf
import numpy as np
import warnings

import sys

sys.path.append("/home/viktorv/Projects/3DMNN/main/models/latent_space/src")

from tflearn.layers.core import fully_connected
from tflearn.activations import sigmoid, relu
from utils.utils import leaky_relu, expand_scope_by_name
from classes.decoders import decoder_with_fc_only

def simple_discriminator(in_data, layer_sizes=[256, 512], b_norm=False, non_linearity=tf.nn.relu, reuse=False, scope=None):
    # Check with normal tf.nn.relu
    # The discriminator consists of 2 FC-ReLU layers with
    # {256, 512} neurons each and a final FC layer with a single
    # sigmoid neuron. 

    layer_sizes = layer_sizes + [1] # + the one sigmoid
    d_logit = decoder_with_fc_only(in_data, layer_sizes=layer_sizes, non_linearity=non_linearity, b_norm=b_norm, reuse=reuse, scope=scope)
    d_prob = tf.nn.sigmoid(d_logit)

    return d_prob, d_logit

def conditional_discriminator():
    # TODO: FUTURE WORK
    pass