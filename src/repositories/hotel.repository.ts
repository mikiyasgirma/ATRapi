import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Hotel, HotelRelations, HotelPerformance} from '../models';
import {HotelPerformanceRepository} from './hotel-performance.repository';

export class HotelRepository extends DefaultCrudRepository<
  Hotel,
  typeof Hotel.prototype.id,
  HotelRelations
> {

  public readonly hotelPerformances: HasManyRepositoryFactory<HotelPerformance, typeof Hotel.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('HotelPerformanceRepository') protected hotelPerformanceRepositoryGetter: Getter<HotelPerformanceRepository>,
  ) {
    super(Hotel, dataSource);
    this.hotelPerformances = this.createHasManyRepositoryFactoryFor('hotelPerformances', hotelPerformanceRepositoryGetter,);
    this.registerInclusionResolver('hotelPerformances', this.hotelPerformances.inclusionResolver);
  }
}
