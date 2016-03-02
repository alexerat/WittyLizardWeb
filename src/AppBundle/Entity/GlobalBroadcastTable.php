<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * GlobalBroadcastTable
 *
 * @ORM\Table(name="Online_Comms.Global_Broadcast_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Boradcast_ID_UNIQUE", columns={"Boradcast_ID"})})
 * @ORM\Entity
 */
class GlobalBroadcastTable
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Broadcast_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $brodId;

    /**
     * @var string
     *
     * @ORM\Column(name="Access_Token", type="string", length=45, nullable=false)
    */
    private $accessToken;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Start_Time", type="datetime")
    */
    private $startTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Book_Time", type="datetime", nullable=false)
    */
    private $bookTime;

    /**
     * @var float
     *
     * @ORM\Column(name="Question_Value", type="decimal", scale=4, precision=10)
    */
    private $qVal;

    /**
     * @var string
     *
     * @ORM\Column(name="Currency", type="string", length=4)
    */
    private $currency;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Expected_Start", type="datetime")
    */
    private $expectedStart;

    /**
     * Get brodId
     *
     * @return integer
     */
    public function getBrodId()
    {
        return $this->brodId;
    }

    /**
     * Set accessToken
     *
     * @param string $accessToken
     *
     * @return GlobalBroadcastTable
     */
    public function setAccessToken($accessToken)
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    /**
     * Get accessToken
     *
     * @return string
     */
    public function getAccessToken()
    {
        return $this->accessToken;
    }

    /**
     * Set startTime
     *
     * @param \DateTime $startTime
     *
     * @return GlobalBroadcastTable
     */
    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;

        return $this;
    }

    /**
     * Get startTime
     *
     * @return \DateTime
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    /**
     * Set bookTime
     *
     * @param \DateTime $bookTime
     *
     * @return GlobalBroadcastTable
     */
    public function setBookTime($bookTime)
    {
        $this->bookTime = $bookTime;

        return $this;
    }

    /**
     * Get bookTime
     *
     * @return \DateTime
     */
    public function getBookTime()
    {
        return $this->bookTime;
    }

    /**
     * Set qVal
     *
     * @param string $qVal
     *
     * @return GlobalBroadcastTable
     */
    public function setQVal($qVal)
    {
        $this->qVal = $qVal;

        return $this;
    }

    /**
     * Get qVal
     *
     * @return string
     */
    public function getQVal()
    {
        return $this->qVal;
    }

    /**
     * Set currency
     *
     * @param string $currency
     *
     * @return GlobalBroadcastTable
     */
    public function setCurrency($currency)
    {
        $this->currency = $currency;

        return $this;
    }

    /**
     * Get currency
     *
     * @return string
     */
    public function getCurrency()
    {
        return $this->currency;
    }

    /**
     * Set expectedStart
     *
     * @param \DateTime $expectedStart
     *
     * @return GlobalBroadcastTable
     */
    public function setExpectedStart($expectedStart)
    {
        $this->expectedStart = $expectedStart;

        return $this;
    }

    /**
     * Get expectedStart
     *
     * @return \DateTime
     */
    public function getExpectedStart()
    {
        return $this->expectedStart;
    }
}
