import os.path as osp
import sys
import matplotlib.pyplot as plt
import numpy as np
import random as rd
from objdict import ObjDict

# TODO: Figure this out
sys.path.append('/home/viktorv/Projects/Daedalus/daedalusAPI/core/generator/src')

from classes.autoencoder import Configuration as Conf
from classes.gan import ConfigurationGAN as ConfGAN
from classes.pointnet_ae import PointNetAutoEncoder

from utils.templates import innofair_architecture
from utils.templates import autoencoder_paper, default_train_params
from utils.io import obj_wrapper

from utils.io import snc_category_to_synth_id, create_dir, PointCloudDataSet, \
                                        load_all_point_clouds_under_folder

from utils.utils import reset_tf_graph
from classes.latent_gan import LatentGAN


top_out_dir = '/home/viktorv/Projects/Daedalus/daedalusAPI/core/generator/data'          # Use to save Neural-Net check-points etc.
top_in_dir = '/home/viktorv/Projects/Daedalus/daedalusAPI/core/generator/data/shape_net_core_uniform_samples_2048/' # Top-dir of where point-clouds are stored.


class Generator:
    
    def __init__(self, experiment_name, object_class="", n_pc_points=2048, bneck_size=128, ae_loss='emd'):
        self.experiment_name = experiment_name
        self.n_pc_points = n_pc_points
        self.bneck_size = bneck_size
        self.ae_loss = ae_loss
        self.object_class = object_class
        self.ae = ObjDict()
        self.ae_model = None
        self.gan = ObjDict()
        self.gan_model = None

        self.syn_id = snc_category_to_synth_id()[self.object_class]
        self.class_dir = osp.join(top_in_dir, self.syn_id)

        self.all_pc_data = load_all_point_clouds_under_folder(self.class_dir, n_threads=8, file_ending='.ply', verbose=False)
        self.train_dir = create_dir(osp.join(top_out_dir, self.experiment_name))
    
    def init_train_ae(self, training_epochs):

        self.train_params = default_train_params()
        self.ae.encoder, self.ae.decoder, self.ae.enc_args, self.ae.dec_args = autoencoder_paper(self.n_pc_points, self.bneck_size)

        self.conf = Conf(
            n_input = [self.n_pc_points, 3],
            loss = self.ae_loss,
            training_epochs = training_epochs,
            batch_size = self.train_params['batch_size'],
            denoising = self.train_params['denoising'],
            learning_rate = self.train_params['learning_rate'],
            train_dir = self.train_dir,
            loss_display_step = self.train_params['loss_display_step'],
            saver_step = self.train_params['saver_step'],
            z_rotate = self.train_params['z_rotate'],
            encoder = self.ae.encoder,
            decoder = self.ae.decoder,
            encoder_args = self.ae.enc_args,
            decoder_args = self.ae.dec_args
        )

        self.conf.experiment_name = self.experiment_name
        self.conf.held_out_step = 5   # How often to evaluate/print out loss on 
                                # held_out data (if they are provided in ae.train() ).
        self.conf.save(osp.join(self.train_dir, 'configuration'))
        reset_tf_graph()
        self.ae_model = PointNetAutoEncoder(self.experiment_name, self.conf)

    def train_ae(self):
        buf_size = 1 # Make 'training_stats' file to flush each output line regarding training.
        fout = open(osp.join(self.conf.train_dir, 'train_stats.txt'), 'a', buf_size)
        self.train_stats = self.ae_model.train(self.all_pc_data, self.conf, log_file=fout)
        fout.close()
        self.latent_codes = self.ae_model.get_latent_codes(self.all_pc_data.point_clouds)

    def restore_ae(self, epoch):
        self.conf = Conf.load(self.train_dir + "/configuration")
        self.conf.encoder_args['verbose'] = False
        self.conf.decoder_args['verbose'] = False

        reset_tf_graph()

        self.ae_model = PointNetAutoEncoder(self.conf.experiment_name, self.conf)
        self.ae_model.restore_model(self.conf.train_dir, epoch, verbose=False)
        self.latent_codes = self.ae_model.get_latent_codes(self.all_pc_data.point_clouds)


    def init_train_gan(self):
        generator, discriminator, params = innofair_architecture(128) # An architecture I've come up with in for the Innofair competition
        self.gan.generator = generator
        self.gan.discriminator = discriminator
        self.gan.params = params


        reset_tf_graph()

        self.gan_model = LatentGAN(
            self.experiment_name, 
            self.gan.params['init_lr'],
            self.gan.params['lambda'],
            self.gan.params['n_out'],
            self.gan.params['noise_dim'],
            self.gan.discriminator,
            self.gan.generator,
            beta = self.gan.params['beta'],
        )

    def train_gan(self, n_epochs=1000):

        train_stats = []
        # Train the GAN.
        saver_step = np.hstack([np.array([1, 5, 10]), np.arange(50, n_epochs + 1, 50)])
        self.latent_gan_data = PointCloudDataSet(self.latent_codes) # self.reconstruct needs to be ran first

        self.gan_model.train(self.latent_gan_data, self.gan.params, n_epochs, "./models_checkpoints/", save_gan_model=True, \
                  saver_step=saver_step, train_stats=train_stats)

    def restore_gan(self, epoch = 1000):

        reset_tf_graph()

        self.gan_model = LatentGAN(
            self.experiment_name, 
            self.gan.params['init_lr'],
            self.gan.params['lambda'],
            self.gan.params['n_out'],
            self.gan.params['noise_dim'],
            self.gan.discriminator,
            self.gan.generator,
            beta = self.gan.params['beta'],
        )

        self.gan_model.restore_model("./models_checkpoints/", epoch, verbose=False)


    
    def generate_pointclouds(self, num=12, just_latent_codes=False):

        self.generated_latent_data = self.gan_model.generate(num, self.gan.params['noise_params']) #Generating 12 latent codes

        if just_latent_codes:
            return self.generated_latent_data
        
        self.pointclouds = []
        
        for vector in self.generated_latent_data:
            self.pointclouds.append(self.ae_model.decode(vector))

        self.pointclouds = np.asarray(self.pointclouds).reshape((num, 2048, 3))

        return self.pointclouds


    def reconstruct_obj(self, reconstructions):

        for i, reconstruction in enumerate(reconstructions):
            obj_wrapper(reconstruction, self.object_class, i)
            
        print("Reconstructed")

    def interpolate(self, _from, _to, steps=10, write_file=True):
        
        self.interpolations = self.ae_model.interpolate(_from, _to, steps)
        interpolation_array = []

        for i, interpolation in enumerate(self.interpolations):
            interpolation_array.append(obj_wrapper(interpolation, self.object_class + "_intr", i))
            #generate_mitsuba_xml(interpolation, self.object_class, i, variation=False)
        
        return interpolation_array


if __name__ == "__main__":
    generator = Generator("single_class_ae", "chair")
    generator.restore_ae(70)

    from_int = rd.randint(0, 4000)
    to_int = rd.randint(0, 4000)

    reconstruction_from = np.asarray(generator.ae_model.reconstruct(generator.all_pc_data.point_clouds[from_int].reshape(1,2048,3)))
    reconstruction_to = np.asarray(generator.ae_model.reconstruct(generator.all_pc_data.point_clouds[to_int].reshape(1,2048,3)))

    # generator.reconstruct_obj(reconstruction_from[0])
    # generator.reconstruct_obj(reconstruction_to[0])
    generator.init_train_gan()
    generator.restore_gan(1000)
    generated_data = generator.generate_pointclouds()

    generator.reconstruct_obj(generated_data)
    generator.interpolate(generated_data[0], generated_data[11], steps=33);

