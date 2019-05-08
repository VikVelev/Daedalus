import numpy as np

import sys
sys.path.append("/home/viktorv/Projects/Daedalus/daedalusAPI/core/generator/src")

from classes.encoders import encoder_with_convs_and_symmetry
from classes.decoders import decoder_with_fc_only

from classes.generators import simple_generator
from classes.discriminators import simple_discriminator

def innofair_architecture(latent_vector_size):

    # TODO For future me: 
    # Work out the classes communication with the gen_params.

    generator = simple_generator
    discriminator = simple_discriminator

    params = {
        "init_lr"      : 10e-5,
        "lambda"       : 10,
        "n_out"        : [latent_vector_size],
        "noise_dim"    : latent_vector_size,
        "beta"         : 0.5,
        "batch_size"   : 50,
        "noise_params" : { 'mu': 0, 'sigma': 0.2 }
    }

    return generator, discriminator, params

def autoencoder_paper(experiment_name, n_pc_points, bneck_size):
    ''' Single class experiments.
    '''
    if n_pc_points != 2048:
        raise ValueError()

    encoder = encoder_with_convs_and_symmetry
    decoder = decoder_with_fc_only

    n_input = [n_pc_points, 3]

    encoder_args = {
        'n_filters': [64, 128, 128, 256, bneck_size],
        'filter_sizes': [1],
        'strides': [1],
        'b_norm': True,
        'verbose': False,
    }

    decoder_args = {
        'layer_sizes': [256, 256, np.prod(n_input)],
        'b_norm': False,
        'b_norm_finish': False,
        'verbose': False,
    }

    return experiment_name, encoder, decoder, encoder_args, decoder_args


def default_train_params(single_class=True):
    
    params = {
        'batch_size': 50,
        'training_epochs': 1000,
        'denoising': False,
        'learning_rate': 0.0005,
        'z_rotate': False,
        'saver_step': 10,
        'loss_display_step': 1
    }

    if not single_class:
        params['z_rotate'] = True
        params['training_epochs'] = 1000

    return params
