import numpy as np
import time
import tensorflow as tf
import sys
import os.path as osp
import matplotlib.pylab as plt

sys.path.append("/home/viktorv/Projects/3DMNN/main/models/latent_space/src")

from classes.gan import GAN

from utils.utils import safe_log
from tflearn import is_training
from utils.io import create_dir, pickle_data, unpickle_data
from classes.gan import ConfigurationGAN as ConfGAN


class LatentGAN(GAN):
    # Gradient Penalty https://arxiv.org/abs/1704.00028
    def __init__(self, name, learning_rate, lam, n_output, noise_dim, discriminator, generator, beta=0.5, gen_kwargs={}, disc_kwargs={}, graph=None):
        # lam = lambda
        GAN.__init__(self, name, graph)
        
        self.noise_dim = noise_dim
        self.n_output = n_output
        self.discriminator = discriminator
        self.generator = generator
    
        with tf.variable_scope(name):
            self.noise = tf.placeholder(tf.float32, shape=[None, noise_dim])            # Noise vector.
            self.real_pc = tf.placeholder(tf.float32, shape=[None] + self.n_output)     # Ground-truth.

            with tf.variable_scope('generator'):
                self.generator_out = self.generator(self.noise, self.n_output, **gen_kwargs)
                
            with tf.variable_scope('discriminator') as scope:
                self.real_prob, self.real_logit = self.discriminator(self.real_pc, scope=scope, **disc_kwargs)
                self.synthetic_prob, self.synthetic_logit = self.discriminator(self.generator_out, reuse=True, scope=scope, **disc_kwargs)
            
            
            # Compute WGAN losses
            self.loss_d = tf.reduce_mean(self.synthetic_logit) - tf.reduce_mean(self.real_logit)
            self.loss_g = -tf.reduce_mean(self.synthetic_logit)

            # Compute gradient penalty at interpolated points 
            # https://arxiv.org/abs/1704.00028
            
            ndims = self.real_pc.get_shape().ndims
            batch_size = tf.shape(self.real_pc)[0]
            alpha = tf.random_uniform(shape=[batch_size] + [1] * (ndims - 1), minval=0., maxval=1.)
            differences = self.generator_out - self.real_pc
            interpolates = self.real_pc + (alpha * differences)

            with tf.variable_scope('discriminator') as scope:
                gradients = tf.gradients(self.discriminator(interpolates, reuse=True, scope=scope, **disc_kwargs)[1], [interpolates])[0]

            # Reduce over all but the first dimension
            print("Calculating initial GP...")
            slopes = tf.sqrt(tf.reduce_sum(tf.square(gradients), reduction_indices=list(range(1, ndims))))
            gradient_penalty = tf.reduce_mean((slopes - 1.) ** 2)
            self.loss_d += lam * gradient_penalty
            

            train_vars = tf.trainable_variables()
            d_params = [v for v in train_vars if v.name.startswith(name + '/discriminator/')]
            g_params = [v for v in train_vars if v.name.startswith(name + '/generator/')]

            self.opt_d = self.optimizer(learning_rate, beta, self.loss_d, d_params)
            self.opt_g = self.optimizer(learning_rate, beta, self.loss_g, g_params)

            self.saver = tf.train.Saver(tf.global_variables(), max_to_keep=None)
            self.init = tf.global_variables_initializer()

            # Launch the session
            config = tf.ConfigProto()
            config.gpu_options.allow_growth = True
            self.sess = tf.Session(config=config)
            self.sess.run(self.init)

    def generator_noise_distribution(self, n_samples, ndims, mu, sigma):
        return np.random.normal(mu, sigma, (n_samples, ndims))

    def _single_epoch_train(self, train_data, batch_size, noise_params, discriminator_boost=5):
        # The discriminator boost means that, the discriminator is trained more to keep up with the generator

        n_examples = train_data.num_examples
        epoch_loss_d = 0.
        epoch_loss_g = 0.
        batch_size = batch_size # Sorry
        n_batches = int(n_examples / batch_size)
        start_time = time.time()

        iterations_for_epoch = n_batches / discriminator_boost

        is_training(True, session=self.sess)
        try:
            # Loop over all batches
            for _ in range(int(iterations_for_epoch)):
                for _ in range(int(discriminator_boost)):

                    feed, _, _ = train_data.next_batch(batch_size)
                    z = self.generator_noise_distribution(batch_size, self.noise_dim, **noise_params)

                    feed_dict = {self.real_pc: feed, self.noise: z}
                    _, loss_d = self.sess.run([self.opt_d, self.loss_d], feed_dict=feed_dict)

                    epoch_loss_d += loss_d

                # Update generator.
                z = self.generator_noise_distribution(batch_size, self.noise_dim, **noise_params)
                feed_dict = {self.noise: z}

                _, loss_g = self.sess.run([self.opt_g, self.loss_g], feed_dict=feed_dict)
                epoch_loss_g += loss_g

            is_training(False, session=self.sess)
        except Exception:
            raise

        finally:
            is_training(False, session=self.sess)

        epoch_loss_d /= (iterations_for_epoch * discriminator_boost)
        epoch_loss_g /= iterations_for_epoch

        duration = time.time() - start_time

        return (epoch_loss_d, epoch_loss_g), duration

    def train(self, latent_codes, params, n_epochs, train_dir, save_gan_model=False, \
              plot_train_curve=True, n_syn_samples=5, saver_step=None, train_stats=None):

        MODEL_SAVER_ID = 'models.ckpt'

        for _ in range(n_epochs):
            loss, duration = self._single_epoch_train(latent_codes, params['batch_size'], params['noise_params'])
            epoch = int(self.sess.run(self.increment_epoch))
            print(epoch, loss)

            if save_gan_model and epoch in saver_step:
                checkpoint_path = osp.join(train_dir, MODEL_SAVER_ID)
                self.saver.save(self.sess, checkpoint_path, global_step=self.epoch)

            train_stats.append((epoch, ) + loss)

        if plot_train_curve:
            x = range(len(train_stats))
            d_loss = [t[1] for t in train_stats]
            g_loss = [t[2] for t in train_stats]
            plt.plot(x, d_loss, '--')
            plt.plot(x, g_loss)
            plt.title('Latent GAN training. (%s)' %("object"))
            plt.legend(['Discriminator', 'Generator'], loc=0)
            
            plt.tick_params(axis='x', which='both', bottom='off', top='off')
            plt.tick_params(axis='y', which='both', left='off', right='off')
            
            plt.xlabel('Epochs.') 
            plt.ylabel('Loss.')

    

