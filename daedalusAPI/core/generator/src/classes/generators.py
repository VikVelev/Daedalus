import tensorflow as tf
import numpy as np
import warnings

import sys
from classes.decoders import decoder_with_fc_only


def simple_generator(z, out_dim, layer_sizes=[128], b_norm=True):
    # The generator consists of 2 FC-ReLUs with {128, k = 128} neurons each.

    layer_sizes = layer_sizes + out_dim
    out_signal = decoder_with_fc_only(z, layer_sizes=layer_sizes, b_norm=b_norm)
    out_signal = tf.nn.relu(out_signal)
    
    return out_signal

def conditional_generator():
    # TODO: FUTURE WORK
    pass