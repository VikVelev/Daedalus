import os.path as osp
import sys
import warnings

import numpy as np
import tensorflow as tf


sys.path.append("/home/viktorv/Projects/3DMNN/main/models/latent_space/src")

from utils.io import create_dir, pickle_data, unpickle_data
from classes.neural_network import NeuralNetwork

model_saver_id = 'models.ckpt'

class GAN(NeuralNetwork):

    def __init__(self, name, graph):
        NeuralNetwork.__init__(self, name, graph)

    def save_model(self, tick):
        self.saver.save(self.sess, model_saver_id, global_step=tick)

    def restore_model(self, model_path, epoch, verbose=False):
        '''Restore all the variables of a saved model.
        '''
        self.saver.restore(self.sess, osp.join(model_path, model_saver_id + '-' + str(int(epoch))))

        if self.epoch.eval(session=self.sess) != epoch:
            warnings.warn('Loaded model\'s epoch doesn\'t match the requested one.')
        else:
            if verbose:
                print('Model restored in epoch {0}.'.format(epoch))

    def optimizer(self, learning_rate, beta, loss, var_list):
        initial_learning_rate = learning_rate
        optimizer = tf.train.AdamOptimizer(initial_learning_rate, beta1=beta).minimize(loss, var_list=var_list)
        return optimizer

    def generate(self, n_samples, noise_params):
        noise = self.generator_noise_distribution(n_samples, self.noise_dim, **noise_params)
        feed_dict = {self.noise: noise}
        return self.sess.run([self.generator_out], feed_dict=feed_dict)[0]


class ConfigurationGAN:

    def __init__(self, name, n_input, generator, n_z, discriminator, train_dir,
                 training_epochs=200, batch_size=10, summary_step=None,
                 learning_rate=0.001, saver_step=None,
                 loss_display_step=1, debug=False, n_output=None, noise_params=None,
                 beta=0.9
                ):

        # Parameters
        self.name = name
        self.n_input = n_input
        self.generator = generator
        self.discriminator = discriminator
        
        # Training related parameters
        self.batch_size = batch_size
        self.train_dir = train_dir
        self.learning_rate = learning_rate
        self.loss_display_step = loss_display_step
        self.saver_step = saver_step
        self.summary_step = summary_step
        self.training_epochs = training_epochs
        self.debug = debug
        self.n_z = n_z
        self.noise_params = noise_params
        self.beta = beta

        if n_output is None:
            self.n_output = n_input
        else:
            self.n_output = n_output

    def exists_and_is_not_none(self, attribute):
        return hasattr(self, attribute) and getattr(self, attribute) is not None

    def __str__(self):
        keys = list(self.__dict__.keys())
        vals = list(self.__dict__.values())
        index = np.argsort(keys)
        res = ''

        for i in index:
            if callable(vals[i]):
                v = vals[i].__name__
            else:
                v = str(vals[i])
            res += '%30s: %s\n' % (str(keys[i]), v)
        return res

    def save(self, file_name):
        pickle_data(file_name + '.pickle', self)
        with open(file_name + '.txt', 'w') as fout:
            fout.write(self.__str__())

    @staticmethod
    def load(file_name):
        return unpickle_data(file_name + '.pickle').next()
