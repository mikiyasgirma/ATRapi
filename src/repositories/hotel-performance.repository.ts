import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Hotel, HotelPerformance, HotelPerformanceRelations} from '../models';
import {HotelRepository} from './hotel.repository';

export class HotelPerformanceRepository extends DefaultCrudRepository<
  HotelPerformance,
  typeof HotelPerformance.prototype.id,
  HotelPerformanceRelations
> {
  public readonly hotel: BelongsToAccessor<
    Hotel,
    typeof HotelPerformance.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('HotelRepository')
    protected hotelRepositoryGetter: Getter<HotelRepository>,
  ) {
    super(HotelPerformance, dataSource);
    this.hotel = this.createBelongsToAccessorFor(
      'hotel',
      hotelRepositoryGetter,
    );

    // Register the relation resolver
    this.registerInclusionResolver('hotel', this.hotel.inclusionResolver);
  }
}
