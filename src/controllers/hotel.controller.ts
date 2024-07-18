import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Hotel} from '../models';
import {HotelRepository} from '../repositories';

@authenticate('jwt')
export class HotelController {
  constructor(
    @repository(HotelRepository)
    public hotelRepository: HotelRepository,
  ) {}

  @post('/hotels')
  @response(200, {
    description: 'Hotel model instance',
    content: {'application/json': {schema: getModelSchemaRef(Hotel)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hotel, {
            title: 'NewHotel',
            exclude: ['id'],
          }),
        },
      },
    })
    hotel: Omit<Hotel, 'id'>,
  ): Promise<Hotel> {
    return this.hotelRepository.create(hotel);
  }

  @get('/hotels/count')
  @response(200, {
    description: 'Hotel model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Hotel) where?: Where<Hotel>): Promise<Count> {
    return this.hotelRepository.count(where);
  }

  @get('/hotels')
  @response(200, {
    description: 'Array of Hotel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Hotel, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Hotel) filter?: Filter<Hotel>): Promise<Hotel[]> {
    return this.hotelRepository.find(filter);
  }

  @patch('/hotels')
  @response(200, {
    description: 'Hotel PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hotel, {partial: true}),
        },
      },
    })
    hotel: Hotel,
    @param.where(Hotel) where?: Where<Hotel>,
  ): Promise<Count> {
    return this.hotelRepository.updateAll(hotel, where);
  }

  @get('/hotels/{id}')
  @response(200, {
    description: 'Hotel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Hotel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Hotel, {exclude: 'where'})
    filter?: FilterExcludingWhere<Hotel>,
  ): Promise<Hotel> {
    return this.hotelRepository.findById(id, filter);
  }

  @patch('/hotels/{id}')
  @response(204, {
    description: 'Hotel PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hotel, {partial: true}),
        },
      },
    })
    hotel: Hotel,
  ): Promise<void> {
    await this.hotelRepository.updateById(id, hotel);
  }

  @put('/hotels/{id}')
  @response(204, {
    description: 'Hotel PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() hotel: Hotel,
  ): Promise<void> {
    await this.hotelRepository.replaceById(id, hotel);
  }

  @del('/hotels/{id}')
  @response(204, {
    description: 'Hotel DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hotelRepository.deleteById(id);
  }

  @get('/hotels/search', {
    responses: {
      '200': {
        description: 'Array of Hotel model instances matching the search term',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': Hotel,
              },
            },
          },
        },
      },
    },
  })
  async search(@param.query.string('term') term: string): Promise<Hotel[]> {
    const filter = {
      where: {
        name: {
          ilike: `%${term}%`, // Case insensitive
        },
      },
    };
    return this.hotelRepository.find(filter);
  }
}
